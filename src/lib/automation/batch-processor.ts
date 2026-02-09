/**
 * Batch Processor for Large-Scale Live Checks
 *
 * Handles checking 1000+ reviews by splitting into manageable batches
 * to prevent browser hangs, memory issues, and server overload
 */

export interface BatchConfig {
  batchSize: number; // Reviews per batch (default: 100)
  concurrency: number; // Concurrent checks per batch (3, 5, or 10)
  delayBetweenBatches: number; // Milliseconds to wait between batches (default: 2000)
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  currentBatchProgress: number; // 0-100
  overallProgress: number; // 0-100
  processedReviews: number;
  totalReviews: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
}

export interface BatchStats {
  live: number;
  missing: number;
  error: number;
}

type BatchStatusCallback = (progress: BatchProgress, stats: BatchStats) => void;
type BatchCompleteCallback = (stats: BatchStats) => void;

export class BatchProcessor {
  private config: BatchConfig = {
    batchSize: 100,
    concurrency: 5,
    delayBetweenBatches: 2000,
  };

  private isPaused = false;
  private isStopped = false;
  private currentBatch = 0;
  private totalBatches = 0;

  private stats: BatchStats = {
    live: 0,
    missing: 0,
    error: 0,
  };

  private onStatusChange?: BatchStatusCallback;
  private onComplete?: BatchCompleteCallback;

  constructor(
    config?: Partial<BatchConfig>,
    onStatusChange?: BatchStatusCallback,
    onComplete?: BatchCompleteCallback
  ) {
    this.config = { ...this.config, ...config };
    this.onStatusChange = onStatusChange;
    this.onComplete = onComplete;
  }

  /**
   * Process reviews in batches
   */
  async processBatches(
    reviewIds: string[],
    checkBatchFn: (
      batchIds: string[],
      concurrency: number
    ) => Promise<{ live: number; missing: number; error: number }>
  ): Promise<void> {
    this.reset();

    // Split into batches
    const batches = this.createBatches(reviewIds);
    this.totalBatches = batches.length;

    console.log(
      `📦 Split ${reviewIds.length} reviews into ${this.totalBatches} batches of ${this.config.batchSize}`
    );

    try {
      for (let i = 0; i < batches.length; i++) {
        // Check if stopped
        if (this.isStopped) {
          console.log('🛑 Batch processing stopped by user');
          this.emitProgress('idle');
          return;
        }

        // Wait if paused
        while (this.isPaused && !this.isStopped) {
          await this.sleep(500);
        }

        this.currentBatch = i + 1;
        const batch = batches[i];

        console.log(
          `\n${'='.repeat(80)}\n📦 Processing Batch ${this.currentBatch}/${this.totalBatches} (${batch.length} reviews)\n${'='.repeat(80)}`
        );

        this.emitProgress('running');

        // Process this batch
        try {
          const batchStats = await checkBatchFn(batch, this.config.concurrency);

          // Accumulate stats
          this.stats.live += batchStats.live;
          this.stats.missing += batchStats.missing;
          this.stats.error += batchStats.error;

          console.log(
            `✅ Batch ${this.currentBatch}/${this.totalBatches} completed: ${batchStats.live} live, ${batchStats.missing} missing, ${batchStats.error} errors`
          );
        } catch (error) {
          console.error(`❌ Error processing batch ${this.currentBatch}:`, error);
          // Continue to next batch instead of failing completely
        }

        // Delay between batches (except for last batch)
        if (i < batches.length - 1 && !this.isStopped) {
          console.log(
            `⏳ Waiting ${this.config.delayBetweenBatches}ms before next batch...`
          );
          await this.sleep(this.config.delayBetweenBatches);
        }
      }

      // All batches completed
      if (!this.isStopped) {
        console.log('\n✅ All batches completed successfully!');
        console.log(`📊 Final Stats: ${this.stats.live} live, ${this.stats.missing} missing, ${this.stats.error} errors`);
        this.emitProgress('completed');
        this.onComplete?.(this.stats);
      }
    } catch (error) {
      console.error('❌ Fatal error in batch processing:', error);
      this.emitProgress('error');
      throw error;
    }
  }

  /**
   * Pause batch processing (finishes current batch, then pauses)
   */
  pause(): void {
    console.log('⏸ Pausing batch processing...');
    this.isPaused = true;
    this.emitProgress('paused');
  }

  /**
   * Resume batch processing
   */
  resume(): void {
    console.log('▶ Resuming batch processing...');
    this.isPaused = false;
    this.emitProgress('running');
  }

  /**
   * Stop batch processing completely
   */
  stop(): void {
    console.log('🛑 Stopping batch processing...');
    this.isStopped = true;
    this.isPaused = false;
    this.emitProgress('idle');
  }

  /**
   * Get current progress
   */
  getProgress(): BatchProgress {
    const processedReviews = (this.currentBatch - 1) * this.config.batchSize +
      (this.currentBatch === this.totalBatches ? this.stats.live + this.stats.missing + this.stats.error : this.config.batchSize);
    const totalReviews = this.totalBatches * this.config.batchSize;

    return {
      currentBatch: this.currentBatch,
      totalBatches: this.totalBatches,
      currentBatchProgress: this.currentBatch > 0
        ? Math.round((processedReviews % this.config.batchSize / this.config.batchSize) * 100)
        : 0,
      overallProgress: totalReviews > 0
        ? Math.round((processedReviews / totalReviews) * 100)
        : 0,
      processedReviews,
      totalReviews,
      status: this.isStopped
        ? 'idle'
        : this.isPaused
        ? 'paused'
        : this.currentBatch === 0
        ? 'idle'
        : this.currentBatch >= this.totalBatches
        ? 'completed'
        : 'running',
    };
  }

  /**
   * Get current stats
   */
  getStats(): BatchStats {
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙ Batch configuration updated:', this.config);
  }

  // Private helper methods

  private createBatches(reviewIds: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < reviewIds.length; i += this.config.batchSize) {
      batches.push(reviewIds.slice(i, i + this.config.batchSize));
    }
    return batches;
  }

  private emitProgress(status: BatchProgress['status']): void {
    const progress = { ...this.getProgress(), status };
    this.onStatusChange?.(progress, this.stats);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private reset(): void {
    this.currentBatch = 0;
    this.totalBatches = 0;
    this.isPaused = false;
    this.isStopped = false;
    this.stats = { live: 0, missing: 0, error: 0 };
  }
}
