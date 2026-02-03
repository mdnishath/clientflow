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
  private queue: AutomationQueue;
  private checker: LiveChecker;
  private isProcessing = false;

  constructor() {
    // Initialize with callback to update database status
    this.queue = new AutomationQueue(3, this.updateCheckStatus.bind(this));
    this.checker = new LiveChecker();
  }

  /**
   * Start checking reviews
   */
  async startChecks(reviewIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      console.log("=".repeat(80));
      console.log(`🎬 START CHECKS CALLED for ${reviewIds.length} reviews`);

      // Fetch reviews from database
      const reviews = await prisma.review.findMany({
        where: {
          id: { in: reviewIds },
          reviewLiveLink: { not: null },
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

      console.log(`✅ Found ${reviews.length} valid reviews with live links`);

      // Add to queue
      const jobs: QueueJob[] = reviews.map((review) => ({
        reviewId: review.id,
        review: review as Review,
        retryCount: 0,
      }));

      console.log("📊 BEFORE adding to queue:", this.queue.getStats());
      this.queue.add(jobs);
      console.log("📊 AFTER adding to queue:", this.queue.getStats());

      // Start processing if not already running
      if (!this.isProcessing) {
        console.log("🚀 Starting queue processor (was not running)");
        this.processQueue();
      } else {
        console.log("⏳ Queue processor already running");
      }

      console.log("📊 FINAL stats (after processQueue call):", this.queue.getStats());
      console.log("=".repeat(80));

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
   * Process queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    console.log("🚀 Starting queue processing...");

    while (!this.queue.isEmpty()) {
      const job = this.queue.getNext();

      if (!job) {
        // No slots available, wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      console.log(`📋 Processing job: ${job.reviewId}`);

      // Process job asynchronously (fire and forget)
      this.processJob(job).catch((error) => {
        console.error(`❌ Error processing job ${job.reviewId}:`, error);
        this.queue.complete(job.reviewId, "ERROR");
      });

      // Small delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("✅ Queue processing complete");

    // Close browser after all jobs are done
    await this.checker.close();
    this.isProcessing = false;
  }

  /**
   * Process a single job
   */
  private async processJob(job: QueueJob): Promise<void> {
    console.log(`🔍 Checking review: ${job.reviewId}`);
    try {
      const result = await this.checker.checkReview(job.review);
      await this.updateReviewResult(result);
      this.queue.complete(job.reviewId, result.status);
      console.log(`✅ Completed: ${job.reviewId} - ${result.status}`);
    } catch (error) {
      console.error(`❌ Failed to check review ${job.reviewId}:`, error);
      // Check if we should retry
      if (job.retryCount < 2) {
        console.log(`🔄 Retrying ${job.reviewId} (attempt ${job.retryCount + 1})`);
        this.queue.retry(job);
      } else {
        console.log(`⛔ Max retries reached for ${job.reviewId}, marking as ERROR`);
        this.queue.complete(job.reviewId, "ERROR");
      }
    }
  }

  /**
   * Stop all checks
   */
  stopChecks(): { success: boolean; message: string } {
    try {
      this.queue.stop();
      return {
        success: true,
        message: "Checks stopped successfully",
      };
    } catch (error) {
      console.error("Error stopping checks:", error);
      return {
        success: false,
        message: "Failed to stop checks",
      };
    }
  }

  /**
   * Update concurrency (thread count)
   */
  updateConcurrency(count: number): { success: boolean; message: string; concurrency: number } {
    try {
      this.queue.setConcurrency(count);
      return {
        success: true,
        message: `Concurrency updated to ${count}`,
        concurrency: this.queue.getConcurrency(),
      };
    } catch (error) {
      console.error("Error updating concurrency:", error);
      return {
        success: false,
        message: "Failed to update concurrency",
        concurrency: this.queue.getConcurrency(),
      };
    }
  }

  /**
   * Update database with check result
   */
  private async updateReviewResult(result: CheckResult): Promise<void> {
    try {
      console.log(`💾 Updating DB: Review ${result.reviewId} → ${result.status}`);
      await prisma.review.update({
        where: { id: result.reviewId },
        data: {
          lastCheckedAt: result.checkedAt,
          checkStatus: result.status,
          screenshotPath: result.screenshotPath || null,
        },
      });

      console.log(`✅ DB UPDATED: Review ${result.reviewId} is now ${result.status}`);
    } catch (error) {
      console.error(`❌ DB UPDATE FAILED for ${result.reviewId}:`, error);
    }
  }

  /**
   * Update check status in database (called by queue)
   */
  private async updateCheckStatus(reviewId: string, status: string): Promise<void> {
    try {
      console.log(`💾 DATABASE UPDATE: Setting review ${reviewId} to ${status}`);
      await prisma.review.update({
        where: { id: reviewId },
        data: { checkStatus: status },
      });
      console.log(`✅ DATABASE UPDATED: Review ${reviewId} is now ${status}`);
    } catch (error) {
      console.error(`❌ Failed to update status for ${reviewId}:`, error);
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const stats = this.queue.getStats();
    console.log("📊 getQueueStats called, returning:", stats);
    return stats;
  }

  /**
   * Get current concurrency
   */
  getConcurrency(): number {
    return this.queue.getConcurrency();
  }

  /**
   * Reset queue (clear history)
   */
  resetQueue(): { success: boolean; message: string } {
    try {
      this.queue.reset();
      return {
        success: true,
        message: "Queue reset successfully",
      };
    } catch (error) {
      console.error("Error resetting queue:", error);
      return {
        success: false,
        message: "Failed to reset queue",
      };
    }
  }

  /**
   * Get recent results for optimistic UI updates
   */
  getRecentResults() {
    return this.queue.getRecentResults();
  }
}

// Export singleton instance
export const automationService = new AutomationService();
