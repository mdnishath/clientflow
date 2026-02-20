/**
 * Live Check Automation - Enhanced Queue Manager
 *
 * In-memory queue with progress tracking and control
 */

import { QueueJob, CheckStatusCallback, QueueStats } from "./types";

export interface RecentResult {
  reviewId: string;
  status: "LIVE" | "MISSING" | "ERROR";
  completedAt: string;
}

export class AutomationQueue {
  private queue: QueueJob[] = [];
  private processing = new Set<string>();
  // Store full result object in Map to persist for UI sync
  private completed = new Map<string, { status: "LIVE" | "MISSING" | "ERROR"; completedAt: string }>();
  private maxConcurrency: number;
  private onStatusChange?: CheckStatusCallback;
  private isStopped = false;

  constructor(maxConcurrency: number = 3, onStatusChange?: CheckStatusCallback) {
    this.maxConcurrency = maxConcurrency;
    this.onStatusChange = onStatusChange;
  }

  /**
   * Add reviews to the queue
   */
  add(jobs: QueueJob[]): void {
    this.isStopped = false; // Reset stop flag
    console.log(`➕ Adding ${jobs.length} jobs to queue`);

    jobs.forEach((job) => {
      // Remove from completed if it exists (allow re-checking)
      if (this.completed.has(job.reviewId)) {
        console.log(`  🔄 Re-checking: ${job.reviewId} (removing from completed)`);
        this.completed.delete(job.reviewId);
      }

      // Avoid duplicates only in current queue and processing
      if (!this.queue.find((j) => j.reviewId === job.reviewId) &&
        !this.processing.has(job.reviewId)) {
        this.queue.push(job);
        console.log(`  ✓ Added: ${job.reviewId}`);
        // Don't set CHECKING here - only when actually picked up for processing
      } else {
        console.log(`  ⚠ Skipped (already in queue/processing): ${job.reviewId}`);
      }
    });
    console.log(`📊 Queue state: ${this.queue.length} pending, ${this.processing.size} processing`);
  }

  /**
   * Get next job if slots available
   */
  getNext(): QueueJob | null {
    if (this.isStopped) {
      console.log("⏸ Queue is stopped");
      return null;
    }

    if (this.processing.size >= this.maxConcurrency) {
      // console.log(`⏳ Max concurrency reached (${this.processing.size}/${this.maxConcurrency})`);
      return null;
    }

    if (this.queue.length === 0) {
      // console.log("📭 Queue is empty");
      return null;
    }

    const job = this.queue.shift();
    if (job) {
      this.processing.add(job.reviewId);
      // Update status to CHECKING when actually picked up for processing
      this.onStatusChange?.(job.reviewId, "CHECKING");
      console.log(`🎯 Assigned job: ${job.reviewId} (${this.processing.size}/${this.maxConcurrency} slots used)`);
    }
    return job || null;
  }

  /**
   * Mark job as completed
   */
  complete(reviewId: string, status: "LIVE" | "MISSING" | "ERROR"): void {
    this.processing.delete(reviewId);
    this.completed.set(reviewId, {
      status,
      completedAt: new Date().toISOString()
    });
    console.log(`✔ Completed: ${reviewId} - ${status} (${this.processing.size} still processing)`);
  }

  /**
   * Re-queue failed job with retry limit
   */
  retry(job: QueueJob): void {
    this.processing.delete(job.reviewId);
    if (job.retryCount < 2 && !this.isStopped) {
      this.queue.push({ ...job, retryCount: job.retryCount + 1 });
    } else {
      this.complete(job.reviewId, "ERROR");
    }
  }

  /**
   * Stop processing (cancel remaining)
   */
  stop(): void {
    this.isStopped = true;
    // Mark pending as cancelled
    this.queue.forEach(job => {
      this.completed.set(job.reviewId, { status: "ERROR", completedAt: new Date().toISOString() });
    });
    this.queue = [];
  }

  /**
   * Get detailed stats
   */
  getStats(): QueueStats {
    const values = Array.from(this.completed.values());
    const liveCount = values.filter(v => v.status === "LIVE").length;
    const missingCount = values.filter(v => v.status === "MISSING").length;
    const errorCount = values.filter(v => v.status === "ERROR").length;
    const totalJobs = this.queue.length + this.processing.size + this.completed.size;

    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.size,
      total: totalJobs,
      liveCount,
      missingCount,
      errorCount,
      doneCount: 0, // Not tracked in queue, tracked in automation service
      isStopped: this.isStopped,
      progress: totalJobs > 0 ? Math.round((this.completed.size / totalJobs) * 100) : 0,
    };
  }

  /**
   * Update concurrency (thread count)
   */
  setConcurrency(count: number): void {
    this.maxConcurrency = Math.max(1, Math.min(10, count)); // Limit 1-10
  }

  /**
   * Get current concurrency
   */
  getConcurrency(): number {
    return this.maxConcurrency;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.processing.size === 0;
  }

  /**
   * Reset queue (clear all)
   */
  reset(): void {
    this.queue = [];
    this.processing.clear();
    this.completed.clear();
    this.isStopped = false;
  }

  /**
   * Get and clear recent results (for optimistic UI updates)
   */
  getRecentResults(): RecentResult[] {
    // Return ALL completed results for the current session/batch.
    // Frontend handles deduplication via processedResultsRef.
    // This solves the race condition where a poll misses the 'flash' of a result.
    return Array.from(this.completed.entries()).map(([reviewId, data]) => ({
      reviewId,
      status: data.status,
      completedAt: data.completedAt
    }));
  }
}
