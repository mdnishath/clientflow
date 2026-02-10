/**
 * Client-side hook for batch processing large-scale live checks
 *
 * Handles 1000+ reviews by splitting into batches and processing sequentially
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch } from '@/lib/hooks';
import { startCheckingReviews, updateCheckStatus } from '@/lib/features/reviewsSlice';
import { toast } from 'sonner';

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

interface BatchCheckOptions {
  batchSize?: number; // Default: 100
  concurrency?: 3 | 5 | 10; // Default: 5
  delayBetweenBatches?: number; // Default: 2000ms
  onProgress?: (progress: BatchProgress, stats: BatchStats) => void;
  onBatchComplete?: (batchNumber: number, totalBatches: number, stats: BatchStats) => void;
  onComplete?: (stats: BatchStats) => void;
}

export function useBatchCheck() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BatchProgress>({
    currentBatch: 0,
    totalBatches: 0,
    currentBatchProgress: 0,
    overallProgress: 0,
    processedReviews: 0,
    totalReviews: 0,
    status: 'idle',
  });
  const [stats, setStats] = useState<BatchStats>({
    live: 0,
    missing: 0,
    error: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Get user-specific localStorage key
  const getBatchStateKey = useCallback(() => {
    const userId = session?.user?.id || 'anonymous';
    return `batchCheckState_${userId}`;
  }, [session?.user?.id]);

  // Restore batch state on mount with validation (for refresh support)
  useEffect(() => {
    if (!session?.user?.id) return; // Don't restore if no user

    const validateAndRestoreState = async () => {
      const savedState = localStorage.getItem(getBatchStateKey());
      if (!savedState) return;

      try {
        const state = JSON.parse(savedState);

        // Check if state is too old (> 1 hour = stale after deployment)
        const isStale = state.timestamp && (Date.now() - state.timestamp > 3600000);
        if (isStale) {
          console.log('🗑️ Clearing stale state (>1 hour old)');
          localStorage.removeItem(getBatchStateKey());
          return;
        }

        // If state claims to be processing, validate with backend
        if (state.isProcessing) {
          try {
            const response = await fetch('/api/automation/status');
            if (!response.ok) {
              console.log('⚠️ Cannot validate state with backend, clearing');
              localStorage.removeItem(getBatchStateKey());
              return;
            }

            const backendState = await response.json();

            // Check if backend actually has active checks
            const backendIsIdle = backendState.stats.processing === 0 &&
                                 backendState.stats.pending === 0;

            if (backendIsIdle) {
              console.log('⚠️ State mismatch: frontend thinks running but backend is idle. Clearing state.');
              localStorage.removeItem(getBatchStateKey());
              toast.info('Previous batch session has ended');
              return;
            }

            // Backend confirms active session - safe to restore
            console.log('✅ Backend confirms active session, restoring state');
            setIsProcessing(true);
            setProgress(state.progress);
            setStats(state.stats);
            // Reconnect to SSE
            reconnectToSSE();
          } catch (error) {
            console.error('Error validating state with backend:', error);
            // If we can't reach backend, clear state to be safe
            localStorage.removeItem(getBatchStateKey());
          }
        }
      } catch (error) {
        console.error('Error restoring batch state:', error);
        localStorage.removeItem(getBatchStateKey());
      }
    };

    validateAndRestoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getBatchStateKey, session?.user?.id]);

  // FIX: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Save batch state to localStorage (user-specific)
  const saveBatchState = useCallback(() => {
    if (!session?.user?.id) return; // Don't save if no user
    localStorage.setItem(getBatchStateKey(), JSON.stringify({
      isProcessing,
      progress,
      stats,
      timestamp: Date.now(), // Add timestamp for freshness check
    }));
  }, [isProcessing, progress, stats, getBatchStateKey, session?.user?.id]);

  // Clear batch state
  const clearBatchState = useCallback(() => {
    localStorage.removeItem(getBatchStateKey());
  }, [getBatchStateKey]);

  // Reconnect to SSE after refresh
  const reconnectToSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/automation/sse');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('result', (event) => {
      try {
        const data = JSON.parse(event.data);

        // Update stats
        setStats(prev => {
          const newStats = { ...prev };
          if (data.status === 'LIVE') newStats.live++;
          else if (data.status === 'MISSING') newStats.missing++;
          else if (data.status === 'ERROR') newStats.error++;
          return newStats;
        });

        // Update progress
        setProgress(prev => ({
          ...prev,
          processedReviews: prev.processedReviews + 1,
          overallProgress: Math.round(((prev.processedReviews + 1) / prev.totalReviews) * 100),
        }));
      } catch (error) {
        console.error('Error parsing SSE result:', error);
      }
    });

    eventSource.addEventListener('stats', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.stats.completed >= progress.totalReviews || data.stats.pending + data.stats.processing === 0) {
          eventSource.close();
          setIsProcessing(false);
          clearBatchState();
        }
      } catch (error) {
        console.error('Error parsing SSE stats:', error);
      }
    });

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };
  }, [progress.totalReviews, clearBatchState]);

  // Save state whenever it changes
  useEffect(() => {
    if (isProcessing) {
      saveBatchState();
    }
  }, [isProcessing, progress, stats, saveBatchState]);

  /**
   * Start batch processing - SERVERSIDE MANAGED
   * Send all reviews to backend in single call, backend handles queue/batching
   */
  const startBatchCheck = useCallback(
    async (reviewIds: string[], options: BatchCheckOptions = {}) => {
      const {
        concurrency = 5,
        onProgress,
        onComplete,
      } = options;

      // Reset state
      setIsProcessing(true);
      isPausedRef.current = false;
      abortControllerRef.current = new AbortController();

      console.log(`📦 Starting serverside batch check: ${reviewIds.length} reviews with ${concurrency} threads`);

      // Initialize progress
      setProgress({
        currentBatch: 0,
        totalBatches: 0,
        currentBatchProgress: 0,
        overallProgress: 0,
        processedReviews: 0,
        totalReviews: reviewIds.length,
        status: 'running',
      });

      setStats({ live: 0, missing: 0, error: 0 });

      try {
        // Mark all reviews as CHECKING in Redux
        dispatch(startCheckingReviews(reviewIds));

        // SINGLE API CALL - send all reviews to backend at once
        const response = await fetch('/api/automation/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewIds,
            concurrency,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start batch check');
        }

        console.log(`✅ Backend accepted ${reviewIds.length} reviews, now monitoring via SSE...`);

        // Connect to SSE for real-time updates
        await monitorBatchProgress(reviewIds.length, onProgress, onComplete);

      } catch (error) {
        console.error('❌ Fatal error in batch processing:', error);
        setProgress(prev => ({ ...prev, status: 'error' }));
        toast.error('Error during batch processing');
        setIsProcessing(false);
        clearBatchState();
      }
    },
    [dispatch, clearBatchState]
  );

  /**
   * Monitor batch progress via SSE (serverside managed)
   */
  const monitorBatchProgress = async (
    totalReviews: number,
    onProgress?: (progress: BatchProgress, stats: BatchStats) => void,
    onComplete?: (stats: BatchStats) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Batched Redux updates to reduce client CPU load
      const updateBuffer: Array<{ id: string; checkStatus: string; lastCheckedAt: string }> = [];
      let batchUpdateTimer: NodeJS.Timeout | null = null;

      const flushUpdates = () => {
        if (updateBuffer.length === 0) return;
        updateBuffer.forEach(update => dispatch(updateCheckStatus(update)));
        updateBuffer.length = 0;
      };

      const scheduleFlush = () => {
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        batchUpdateTimer = setTimeout(flushUpdates, 1000); // Batch every 1 second
      };

      // Connect to SSE (reuse existing connection if available)
      let eventSource = eventSourceRef.current;
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        eventSource = new EventSource('/api/automation/sse');
        eventSourceRef.current = eventSource;
        console.log('📡 Created new SSE connection for serverside batch');
      } else {
        console.log('♻️ Reusing existing SSE connection for serverside batch');
      }

      eventSource.addEventListener('result', (event) => {
        try {
          const data = JSON.parse(event.data);

          // Buffer Redux updates (reduce CPU load)
          updateBuffer.push({
            id: data.reviewId,
            checkStatus: data.status,
            lastCheckedAt: data.completedAt,
          });
          scheduleFlush();

          // Update stats
          setStats(prev => {
            const newStats = {
              live: data.status === 'LIVE' ? prev.live + 1 : prev.live,
              missing: data.status === 'MISSING' ? prev.missing + 1 : prev.missing,
              error: data.status === 'ERROR' ? prev.error + 1 : prev.error,
            };
            onProgress?.(progress, newStats);
            return newStats;
          });
        } catch (error) {
          console.error('Error parsing SSE result:', error);
        }
      });

      eventSource.addEventListener('stats', (event) => {
        try {
          const data = JSON.parse(event.data);
          const backendStats = data.stats;

          // Update progress based on backend stats
          const overallProgress = Math.round((backendStats.completed / totalReviews) * 100);

          setProgress(prev => ({
            ...prev,
            processedReviews: backendStats.completed,
            overallProgress,
          }));

          // Check if complete (queue empty AND no active threads)
          const isComplete = backendStats.completed >= totalReviews ||
              (backendStats.pending === 0 && backendStats.processing === 0 && backendStats.completed > 0);

          if (isComplete) {
            if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
            flushUpdates();
            console.log(`✅ Serverside batch complete (${backendStats.completed}/${totalReviews} processed)`);

            setProgress(prev => ({
              ...prev,
              overallProgress: 100,
              status: 'completed',
            }));

            setIsProcessing(false);
            clearBatchState();

            toast.success(
              `All ${totalReviews} reviews checked! ${stats.live} live, ${stats.missing} missing, ${stats.error} errors`
            );

            onComplete?.(stats);
            resolve();
          }
        } catch (error) {
          console.error('Error parsing SSE stats:', error);
        }
      });

      // Listen for system-complete event
      eventSource.addEventListener('system-complete', (event) => {
        console.log('📢 Backend system-complete event received');
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();

        setProgress(prev => ({
          ...prev,
          overallProgress: 100,
          status: 'completed',
        }));

        setIsProcessing(false);
        clearBatchState();

        toast.success(`All reviews checked!`);
        onComplete?.(stats);
        resolve();
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();

        if (eventSource === eventSourceRef.current) {
          eventSource.close();
          eventSourceRef.current = null;
        }

        reject(new Error('SSE connection failed'));
      };

      // Timeout after 30 minutes
      setTimeout(() => {
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();
        console.warn('⚠️ Serverside batch timeout');
        reject(new Error('Batch processing timeout'));
      }, 1800000);
    });
  };

  /**
   * Process a single batch (DEPRECATED - keeping for backward compatibility)
   */
  const processSingleBatch = async (
    reviewIds: string[],
    concurrency: number,
    batchNumber: number,
    totalBatches: number,
    onProgress: (progress: number) => void
  ): Promise<BatchStats> => {
    // Start the check via API
    const response = await fetch('/api/automation/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewIds,
        concurrency,
        batchInfo: {
          isBatch: true,
          batchNumber,
          totalBatches,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start batch check');
    }

    // Poll for progress via SSE or status endpoint
    return new Promise((resolve, reject) => {
      let processedCount = 0;
      const batchStats: BatchStats = { live: 0, missing: 0, error: 0 };

      // Batched Redux updates to reduce client CPU load
      const updateBuffer: Array<{ id: string; checkStatus: string; lastCheckedAt: string }> = [];
      let batchUpdateTimer: NodeJS.Timeout | null = null;

      const flushUpdates = () => {
        if (updateBuffer.length === 0) return;

        // Dispatch all buffered updates at once
        updateBuffer.forEach(update => {
          dispatch(updateCheckStatus(update));
        });
        updateBuffer.length = 0; // Clear buffer
      };

      const scheduleFlush = () => {
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        batchUpdateTimer = setTimeout(flushUpdates, 1000); // Batch every 1 second
      };

      // Connect to SSE for real-time updates (reuse existing connection if available)
      let eventSource = eventSourceRef.current;
      let isNewConnection = false;

      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        eventSource = new EventSource('/api/automation/sse');
        eventSourceRef.current = eventSource;
        isNewConnection = true;
        console.log('📡 Created new SSE connection for batch');
      } else {
        console.log('♻️ Reusing existing SSE connection for batch');
      }

      eventSource.addEventListener('result', (event) => {
        try {
          const data = JSON.parse(event.data);

          // OPTIMIZATION: Buffer Redux updates and flush every 2 seconds
          // This reduces 805 individual dispatches to ~50 batched dispatches
          // Massively reduces client CPU load from 95% to normal levels
          updateBuffer.push({
            id: data.reviewId,
            checkStatus: data.status,
            lastCheckedAt: data.completedAt,
          });
          scheduleFlush(); // Batched flush every 1 second

          // Update batch stats (for popup display)
          if (data.status === 'LIVE') batchStats.live++;
          else if (data.status === 'MISSING') batchStats.missing++;
          else if (data.status === 'ERROR') batchStats.error++;

          processedCount++;

          // Update progress AND stats in parent hook state
          const progress = Math.round((processedCount / reviewIds.length) * 100);
          onProgress(progress);

          // Update the hook's stats state so popup shows real counts
          setStats({ ...batchStats });
        } catch (error) {
          console.error('Error parsing SSE result:', error);
        }
      });

      eventSource.addEventListener('stats', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Check if batch is complete (queue empty AND no active threads)
          const isComplete = data.stats.completed >= reviewIds.length ||
              (data.stats.pending === 0 && data.stats.processing === 0 && processedCount > 0);

          if (isComplete) {
            // Flush any remaining updates
            if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
            flushUpdates();
            // DON'T close SSE - keep it alive for next batch
            console.log(`✅ Batch complete (${processedCount}/${reviewIds.length} processed), keeping SSE alive`);
            resolve(batchStats);
          }
        } catch (error) {
          console.error('Error parsing SSE stats:', error);
        }
      });

      // Listen for system-complete event (backend finished entire queue)
      eventSource.addEventListener('system-complete', (event) => {
        console.log('📢 Backend system-complete event received');
        // Flush any remaining updates
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();
        // Resolve immediately when backend says complete
        if (processedCount > 0) {
          console.log(`✅ Force completing batch due to system-complete (${processedCount} processed)`);
          resolve(batchStats);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        // Flush any remaining updates
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();

        // Close and cleanup failed connection
        if (eventSource === eventSourceRef.current) {
          eventSource.close();
          eventSourceRef.current = null;
        }

        // Fallback: poll status endpoint
        pollBatchStatus(reviewIds.length, batchStats, onProgress, resolve, reject);
      };

      // Timeout after 10 minutes per batch
      setTimeout(() => {
        // Flush any remaining updates
        if (batchUpdateTimer) clearTimeout(batchUpdateTimer);
        flushUpdates();
        // Timeout but don't close SSE
        console.warn('⚠️ Batch timeout, but keeping SSE alive');
        reject(new Error('Batch processing timeout'));
      }, 600000);
    });
  };

  /**
   * Fallback polling for batch status
   */
  const pollBatchStatus = async (
    expectedCount: number,
    batchStats: BatchStats,
    onProgress: (progress: number) => void,
    resolve: (stats: BatchStats) => void,
    reject: (error: Error) => void
  ) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/automation/status');
        const data = await response.json();

        const completed = data.stats.completed || 0;
        const progress = Math.round((completed / expectedCount) * 100);
        onProgress(progress);

        // Update batch stats from recent results
        const resultsResponse = await fetch('/api/automation/status');
        const resultsData = await resultsResponse.json();

        if (resultsData.recentResults) {
          batchStats.live = resultsData.recentResults.filter((r: any) => r.status === 'LIVE').length;
          batchStats.missing = resultsData.recentResults.filter((r: any) => r.status === 'MISSING').length;
          batchStats.error = resultsData.recentResults.filter((r: any) => r.status === 'ERROR').length;
        }

        if (completed >= expectedCount || data.stats.pending + data.stats.processing === 0) {
          clearInterval(pollInterval);
          resolve(batchStats);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        reject(error as Error);
      }
    }, 2000);
  };

  /**
   * Pause batch processing
   */
  const pause = useCallback(() => {
    isPausedRef.current = true;
    setProgress(prev => ({ ...prev, status: 'paused' }));
    toast.info('Batch processing paused (will complete current batch first)');
  }, []);

  /**
   * Resume batch processing
   */
  const resume = useCallback(() => {
    isPausedRef.current = false;
    setProgress(prev => ({ ...prev, status: 'running' }));
    toast.success('Batch processing resumed');
  }, []);

  /**
   * Stop batch processing
   */
  const stop = useCallback(async () => {
    try {
      // Call API to stop server-side automation
      const response = await fetch('/api/automation/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Failed to stop automation on server');
      }

      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Abort client-side loop
      abortControllerRef.current?.abort();
      isPausedRef.current = false;

      // Clear state
      setProgress({
        currentBatch: 0,
        totalBatches: 0,
        currentBatchProgress: 0,
        overallProgress: 0,
        processedReviews: 0,
        totalReviews: 0,
        status: 'idle',
      });
      setIsProcessing(false);
      clearBatchState();

      toast.warning('Batch processing stopped');
    } catch (error) {
      console.error('Error stopping batch:', error);
      toast.error('Failed to stop batch processing');
    }
  }, [clearBatchState]);

  /**
   * Clear/Reset - clear all state and stats
   */
  const clear = useCallback(() => {
    // Close SSE connection if exists
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Abort any pending operations
    abortControllerRef.current?.abort();
    isPausedRef.current = false;

    // Reset all state
    setProgress({
      currentBatch: 0,
      totalBatches: 0,
      currentBatchProgress: 0,
      overallProgress: 0,
      processedReviews: 0,
      totalReviews: 0,
      status: 'idle',
    });

    setStats({
      live: 0,
      missing: 0,
      error: 0,
    });

    setIsProcessing(false);
    clearBatchState();

    toast.success('Progress cleared');
  }, [clearBatchState]);

  return {
    isProcessing,
    progress,
    stats,
    startBatchCheck,
    pause,
    resume,
    stop,
    clear, // NEW: Expose clear function
  };
}

// Helper functions

function createBatches(items: string[], batchSize: number): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
