/**
 * Live Check Automation - Service Orchestrator
 * EXACT SAME ARCHITECTURE as your 100% working Express app
 */

import { prisma } from "@/lib/prisma";
import { LiveChecker } from "./checker";
import { Review, CheckResult } from "./types";
import { automationEvents } from "./events";

interface AutomationState {
  isChecking: boolean;
  totalTasks: number;
  completedTasks: number;
  activeThreads: number;
  maxThreads: number;
  queue: Review[];
  currentlyChecking: Array<{ id: string; thread: number; activity: string }>;
  userId: string | null;
  // Track results for real-time stats
  liveCount: number;
  missingCount: number;
  errorCount: number;
}

class AutomationService {
  private checker: LiveChecker;
  private state: AutomationState = {
    isChecking: false,
    totalTasks: 0,
    completedTasks: 0,
    activeThreads: 0,
    maxThreads: 5,
    queue: [],
    currentlyChecking: [],
    userId: null,
    liveCount: 0,
    missingCount: 0,
    errorCount: 0,
  };

  constructor() {
    this.checker = new LiveChecker();
  }

  /**
   * Add log entry
   */
  private addLog(msg: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${msg}`);
  }

  /**
   * Update concurrency (thread count)
   */
  updateConcurrency(concurrency: number): { success: boolean; message: string; concurrency: number } {
    this.state.maxThreads = Math.max(1, Math.min(10, concurrency));
    console.log(`⚙ Updated concurrency to ${this.state.maxThreads}`);

    return {
      success: true,
      message: `Concurrency updated to ${this.state.maxThreads}`,
      concurrency: this.state.maxThreads
    };
  }

  /**
   * Update session activity (like "NAVIGATING...", "AUDITING DOM...")
   */
  private updateSession(taskId: string, activity: string): void {
    const idx = this.state.currentlyChecking.findIndex((c) => c.id === taskId);
    if (idx !== -1) {
      this.state.currentlyChecking[idx].activity = activity;
    }
  }

  /**
   * Process a single review check (equivalent to checkReviewLink)
   */
  private async checkReview(review: Review, threadIndex: number): Promise<void> {
    const taskId = review.id;

    try {
      this.addLog(`Node #${threadIndex}: Starting check for ${taskId.slice(-5)}`);

      // Use the LiveChecker to check the review
      const result = await this.checker.checkReview(review);

      // Update database
      await this.updateReviewResult(result);

      this.addLog(
        `Node #${threadIndex}: [${result.status.toUpperCase()}] -> ${review.id.slice(-5)}`
      );

      // Update stats counters based on result
      if (result.status === "LIVE") {
        this.state.liveCount++;
      } else if (result.status === "MISSING") {
        this.state.missingCount++;
      } else if (result.status === "ERROR") {
        this.state.errorCount++;
      }

      // Emit result event
      automationEvents.emit("result", {
        userId: this.state.userId!,
        reviewId: review.id,
        status: result.status,
        completedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      this.addLog(
        `Node #${threadIndex}: ERROR/TIMEOUT (${err.message?.slice(0, 30) || "Unknown error"})`
      );

      // Update error count
      this.state.errorCount++;

      // Emit error result
      automationEvents.emit("result", {
        userId: this.state.userId!,
        reviewId: review.id,
        status: "ERROR",
        completedAt: new Date().toISOString(),
      });
    } finally {
      // Thread completed
      this.state.activeThreads--;
      this.state.completedTasks++;
      this.state.currentlyChecking = this.state.currentlyChecking.filter(
        (c) => c.id !== taskId
      );

      // Emit updated stats
      automationEvents.emit("stats", {
        userId: this.state.userId!,
        stats: this.getQueueStats(this.state.userId!),
      });

      // Process next in queue
      this.processQueue();
    }
  }

  /**
   * Process queue - EXACT SAME LOGIC as Express app
   */
  private processQueue(): void {
    // KEY: Check isChecking flag first (same as Express app)
    if (!this.state.isChecking || this.state.queue.length === 0) {
      if (this.state.activeThreads === 0) {
        this.state.isChecking = false;
        this.addLog("Engine: Batch Process Finalized.");
        automationEvents.emit("complete", { timestamp: new Date().toISOString() });
      }
      return;
    }

    // Start new threads up to maxThreads limit
    while (
      this.state.activeThreads < this.state.maxThreads &&
      this.state.queue.length > 0
    ) {
      const review = this.state.queue.shift()!;
      this.state.activeThreads++;
      const threadIndex = this.state.activeThreads;

      // Add to currently checking list
      this.state.currentlyChecking.push({
        id: review.id,
        thread: threadIndex,
        activity: "Initializing...",
      });

      // Start check (non-blocking)
      this.checkReview(review, threadIndex);
    }
  }

  /**
   * Start checks - EXACT SAME LOGIC as Express /automation/start
   */
  async startChecks(
    reviewIds: string[],
    userId: string,
    options?: {
      isBatch?: boolean;
      batchNumber?: number;
      totalBatches?: number;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const batchInfo = options?.isBatch
        ? ` (Batch ${options.batchNumber}/${options.totalBatches})`
        : '';

      console.log("=".repeat(80));
      console.log(`🎬 START CHECKS for user ${userId} (${reviewIds.length} reviews)${batchInfo}`);

      // ISOLATION: Check if another user is already running
      if (this.state.isChecking && this.state.userId && this.state.userId !== userId) {
        console.log(`❌ REJECTED: User ${this.state.userId} is already running checks`);
        return {
          success: false,
          message: `Another user is currently running checks. Please wait.`,
        };
      }

      // Fetch reviews from database
      const reviews = await prisma.review.findMany({
        where: {
          id: { in: reviewIds },
          reviewLiveLink: { not: null },
        },
        select: {
          id: true,
          reviewLiveLink: true,
          profileId: true,
          reviewText: true,
          profile: {
            select: {
              businessName: true,
            }
          }
        }
      });

      if (reviews.length === 0) {
        return {
          success: false,
          message: "No valid reviews found with live links",
        };
      }

      console.log(`✅ Found ${reviews.length} valid reviews${batchInfo}`);

      // SAME AS EXPRESS: Reset state and start
      this.state = {
        isChecking: true,
        totalTasks: reviews.length,
        completedTasks: 0,
        activeThreads: 0,
        maxThreads: this.state.maxThreads,
        queue: reviews as Review[],
        currentlyChecking: [],
        userId,
        liveCount: 0,     // Reset counters
        missingCount: 0,
        errorCount: 0,
      };

      this.addLog(`Audit Sequence Engaged${batchInfo}`);

      // Emit initial stats
      automationEvents.emit("stats", {
        userId,
        stats: this.getQueueStats(userId),
        batchInfo: options?.isBatch ? {
          current: options.batchNumber,
          total: options.totalBatches
        } : undefined
      });

      // Start processing (each check creates its own browser)
      this.processQueue();

      return {
        success: true,
        message: `${reviews.length} review(s) added to queue${batchInfo}`,
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
   * Stop checks - EXACT SAME LOGIC as Express /automation/stop
   */
  stopChecks(userId: string): { success: boolean; message: string } {
    console.log(`🛑 STOP requested for user ${userId}`);

    // KEY: Immediately set flag to false and clear queue
    this.state.isChecking = false;
    this.state.queue = [];

    this.addLog("Audit Aborted by User.");

    // Emit final stats
    automationEvents.emit("stats", {
      userId,
      stats: this.getQueueStats(userId)
    });

    return { success: true, message: "Stopped" };
  }

  /**
   * Get queue stats with real-time counts (USER-ISOLATED)
   */
  getQueueStats(userId: string) {
    // ISOLATION: Only return stats if user matches current checking user
    if (this.state.userId && this.state.userId !== userId) {
      // Different user is running - return empty stats
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        total: 0,
        liveCount: 0,
        missingCount: 0,
        errorCount: 0,
        isStopped: true,
        progress: 0,
        message: 'Another user is currently running checks',
      };
    }

    // Return actual stats for current user
    return {
      pending: this.state.queue.length,
      processing: this.state.activeThreads,
      completed: this.state.completedTasks,
      total: this.state.totalTasks,
      liveCount: this.state.liveCount,      // ✅ Real count
      missingCount: this.state.missingCount, // ✅ Real count
      errorCount: this.state.errorCount,     // ✅ Real count
      isStopped: !this.state.isChecking,
      progress: this.state.totalTasks > 0
        ? Math.round((this.state.completedTasks / this.state.totalTasks) * 100)
        : 0,
    };
  }

  /**
   * Reset queue
   */
  resetQueue(userId: string): { success: boolean; message: string } {
    this.state = {
      isChecking: false,
      totalTasks: 0,
      completedTasks: 0,
      activeThreads: 0,
      maxThreads: this.state.maxThreads,
      queue: [],
      currentlyChecking: [],
      userId: null,
      liveCount: 0,
      missingCount: 0,
      errorCount: 0,
    };

    this.addLog("Queue reset successfully");
    return { success: true, message: "Queue reset successfully" };
  }

  /**
   * Get recent results (for SSE)
   */
  getRecentResults(userId: string) {
    // In the new architecture, results are emitted via events
    // This is kept for compatibility
    return [];
  }

  /**
   * Wait for completion (for batch processing)
   */
  async waitForCompletion(userId: string, timeoutMs: number = 300000): Promise<boolean> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // Check if completed or stopped or timeout
        if (!this.state.isChecking || this.state.activeThreads === 0) {
          clearInterval(checkInterval);
          console.log(`✅ Queue completed for user ${userId}`);
          resolve(true);
          return;
        }

        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          console.log(`⏰ Queue wait timeout for user ${userId}`);
          resolve(false);
          return;
        }
      }, 500);
    });
  }

  // Browser restart not needed - each check uses fresh browser

  /**
   * Update review result in database
   * NEW STATUS LOGIC RULES:
   * - If main status is APPLIED and badge is MISSING -> keep APPLIED (don't change)
   * - If main status is APPLIED and badge is LIVE -> change to LIVE
   * - If both badges MISSING -> change to MISSING
   * - If both badges LIVE -> change to LIVE
   */
  private async updateReviewResult(result: CheckResult): Promise<void> {
    try {
      // First, get the current review status
      const currentReview = await prisma.review.findUnique({
        where: { id: result.reviewId },
        select: { status: true }
      });

      if (!currentReview) {
        console.error(`❌ Review ${result.reviewId} not found`);
        return;
      }

      const currentStatus = currentReview.status;

      const updateData: any = {
        lastCheckedAt: result.checkedAt,
        checkStatus: result.status,
        screenshotPath: result.screenshotPath || null,
      };

      // Apply the new status logic rules
      if (result.status === "LIVE") {
        // Badge is LIVE -> main status becomes LIVE (regardless of current status)
        updateData.status = "LIVE";
        updateData.completedAt = new Date();
      } else if (result.status === "MISSING") {
        // Badge is MISSING
        if (currentStatus === "APPLIED") {
          // If main status is APPLIED and badge is MISSING -> keep APPLIED (no change)
          // Don't update the main status, only update checkStatus
          delete updateData.status;
        } else {
          // For other statuses, set to MISSING
          updateData.status = "MISSING";
        }
      }
      // For ERROR status, we don't change the main status, only checkStatus

      await prisma.review.update({
        where: { id: result.reviewId },
        data: updateData,
      });
    } catch (error) {
      console.error(`❌ DB UPDATE FAILED for ${result.reviewId}:`, error);
    }
  }
}

const globalForAutomation = global as unknown as { automationService: AutomationService };

export const automationService = globalForAutomation.automationService || new AutomationService();

if (process.env.NODE_ENV !== "production") globalForAutomation.automationService = automationService;
