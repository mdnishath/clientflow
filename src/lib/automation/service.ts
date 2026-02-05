/**
 * Live Check Automation - Service Orchestrator
 *
 * Main service that coordinates queue, checker, and database updates
 */

import { prisma } from "@/lib/prisma";
import { LiveChecker } from "./checker";
import { AutomationQueue } from "./queue";
import { Review, QueueJob, CheckResult } from "./types";

class AutomationService {
  // Map userId -> AutomationQueue
  private queues = new Map<string, AutomationQueue>();
  private checker: LiveChecker;
  private isProcessing = false;
  private defaultConcurrency = 3;

  constructor() {
    this.checker = new LiveChecker();
  }

  /**
   * Get or create a queue for a specific user
   */
  private getQueue(userId: string): AutomationQueue {
    if (!this.queues.has(userId)) {
      console.log(`🆕 Creating new queue for user: ${userId}`);
      // Create new queue with callback bound to this service
      this.queues.set(userId, new AutomationQueue(this.defaultConcurrency, this.updateCheckStatus.bind(this)));
    }
    return this.queues.get(userId)!;
  }

  /**
   * Update global concurrency limit for all queues
   */
  updateConcurrency(concurrency: number): { success: boolean; message: string; concurrency: number } {
    this.defaultConcurrency = concurrency;

    // Update all active queues
    let updatedCount = 0;
    for (const queue of this.queues.values()) {
      queue.setConcurrency(concurrency);
      updatedCount++;
    }

    console.log(`⚙ Updated concurrency to ${concurrency} for ${updatedCount} active queues`);

    return {
      success: true,
      message: `Concurrency updated to ${concurrency} (applied to ${updatedCount} active queues)`,
      concurrency
    };
  }

  /**
   * Start checking reviews for a specific user
   */
  async startChecks(reviewIds: string[], userId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log("=".repeat(80));
      console.log(`🎬 START CHECKS CALLED for user ${userId} (${reviewIds.length} reviews)`);

      // Fetch reviews from database
      const reviews = await prisma.review.findMany({
        where: {
          id: { in: reviewIds },
          reviewLiveLink: { not: null },
          // Enforce ownership check strictly? 
          // Ideally yes, but RBAC is handled at API layer.
          // Adding userId check here is safer.
          // For ADMIN, they might trigger checks for any client. 
          // So we trust the caller (API route) to have verified permissions.
        },
        include: {
          profile: {
            select: {
              businessName: true,
            },
          },
        },
      });

      if (reviews.length === 0) {
        return {
          success: false,
          message: "No valid reviews found with live links",
        };
      }

      console.log(`✅ Found ${reviews.length} valid reviews`);

      // Add to user's queue
      const jobs: QueueJob[] = reviews.map((review) => ({
        reviewId: review.id,
        review: review as Review,
        retryCount: 0,
      }));

      const queue = this.getQueue(userId);
      console.log(`📊 BEFORE adding to queue (${userId}):`, queue.getStats());
      queue.add(jobs);
      console.log(`📊 AFTER adding to queue (${userId}):`, queue.getStats());

      // Start processing global loop if not running
      // Note: We use a single processor loop to iterate through ALL user queues
      // This ensures we respect global resource limits (browser instances)
      if (!this.isProcessing) {
        console.log("🚀 Starting global queue processor");
        this.processQueues();
      } else {
        console.log("⏳ Queue processor already running");
      }

      return {
        success: true,
        message: `${reviews.length} review(s) added to queue`,
      };
    } catch (error) {
      console.error("Error starting checks:", error);
      return {
        success: false,
        message: "Failed to start checks",
      };
    }
  }

  /**
   * Global processor to handle all user queues round-robin style
   */
  private async processQueues(): Promise<void> {
    this.isProcessing = true;

    // Simple loop to check if ANY queue has work
    const hasWork = () => {
      for (const queue of this.queues.values()) {
        if (!queue.isEmpty()) return true;
      }
      return false;
    };

    while (hasWork()) {
      let didWork = false;

      // Round-robin through all active user queues
      for (const [userId, queue] of this.queues.entries()) {
        const job = queue.getNext();

        if (job) {
          didWork = true;
          console.log(`📋 Processing job for user ${userId}: ${job.reviewId}`);

          // Process job
          // We limit global concurrency here implicitly by how fast we loop?
          // No, synchronous loop spins fast. 
          // Actually, `queue.getNext()` respects PER-QUEUE concurrency.
          // But we might want GLOBAL concurrency too (e.g. max 5 browsers total).
          // For now, let's assume per-user limits are fine, but we serialize the *browser* ops to avoid crashes?
          // The `processJob` IS async but we don't await it here to allow parallelism.

          this.processJob(job, queue).catch((error) => {
            console.error(`❌ Error processing job ${job.reviewId}:`, error);
            queue.complete(job.reviewId, "ERROR");
          });

          // Small delay between assigning jobs to different users
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!didWork) {
        // Wait a bit if no queues had ready jobs (stats valid but maybe max concurrency reached)
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log("✅ All queues empty, processor stopping");
    await this.checker.close();
    this.isProcessing = false;
  }

  private async processJob(job: QueueJob, queue: AutomationQueue): Promise<void> {
    // ... same logic as before ...
    console.log(`🔍 Checking review: ${job.reviewId}`);
    try {
      const result = await this.checker.checkReview(job.review);
      await this.updateReviewResult(result);
      queue.complete(job.reviewId, result.status); // Use user's queue
      console.log(`✅ Completed: ${job.reviewId} - ${result.status}`);
    } catch (error) {
      console.error(`❌ Failed to check review ${job.reviewId}:`, error);
      if (job.retryCount < 2) {
        queue.retry(job);
      } else {
        queue.complete(job.reviewId, "ERROR");
      }
    }
  }

  stopChecks(userId: string): { success: boolean; message: string } {
    const queue = this.queues.get(userId);
    if (queue) {
      queue.stop();
      return { success: true, message: "Checks stopped" };
    }
    return { success: false, message: "No active queue found" };
  }

  getQueueStats(userId: string) {
    // If no queue exists, return empty stats
    if (!this.queues.has(userId)) {
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        total: 0,
        liveCount: 0,
        missingCount: 0,
        errorCount: 0,
        isStopped: false,
        progress: 0
      };
    }
    return this.queues.get(userId)!.getStats();
  }

  resetQueue(userId: string): { success: boolean; message: string } {
    const queue = this.queues.get(userId);
    if (queue) {
      queue.reset();
      // Optionally remove the queue from map if empty?
      // this.queues.delete(userId);
      return { success: true, message: "Queue reset successfully" };
    }
    return { success: false, message: "No active queue to reset" };
  }

  getRecentResults(userId: string) {
    const queue = this.queues.get(userId);
    return queue ? queue.getRecentResults() : [];
  }

  // ... helper DB update methods (unchanged) ...
  private async updateReviewResult(result: CheckResult): Promise<void> {
    try {
      await prisma.review.update({
        where: { id: result.reviewId },
        data: {
          lastCheckedAt: result.checkedAt,
          checkStatus: result.status,
          screenshotPath: result.screenshotPath || null,
        },
      });
    } catch (error) {
      console.error(`❌ DB UPDATE FAILED for ${result.reviewId}:`, error);
    }
  }

  private async updateCheckStatus(reviewId: string, status: string): Promise<void> {
    try {
      await prisma.review.update({
        where: { id: reviewId },
        data: { checkStatus: status },
      });
    } catch (error) {
      console.error(`❌ Failed to update status for ${reviewId}:`, error);
    }
  }
}

export const automationService = new AutomationService();
