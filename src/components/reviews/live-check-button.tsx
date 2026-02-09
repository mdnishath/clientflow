/**
 * Live Check Button Component
 *
 * Trigger button for starting live checks
 * Automatically uses batch processing for large operations (>200 reviews)
 */

"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Activity, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useBatchCheck } from "@/hooks/use-batch-check";
import { Progress } from "@/components/ui/progress";

interface LiveCheckButtonProps {
  selectedIds: string[];
  allReviewIds?: string[];
  concurrency?: 3 | 5 | 10;
  onCheckStart?: (reviewIds: string[]) => void;
  onCheckComplete?: () => void;
}

const BATCH_THRESHOLD = 200; // Use batch processing for >200 reviews

export function LiveCheckButton({
  selectedIds,
  allReviewIds = [],
  concurrency = 5,
  onCheckStart,
  onCheckComplete,
}: LiveCheckButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const {
    isProcessing,
    progress,
    stats,
    startBatchCheck,
    pause,
    resume,
    stop,
  } = useBatchCheck();

  // Auto-show batch dialog when processing (handles refresh case)
  useEffect(() => {
    if (isProcessing && !showBatchDialog) {
      setShowBatchDialog(true);
    }
  }, [isProcessing]);

  const startCheck = async (reviewIds: string[]) => {
    if (reviewIds.length === 0) {
      toast.error("No reviews to check");
      return;
    }

    // Detect if this is a large batch operation
    if (reviewIds.length > BATCH_THRESHOLD) {
      console.log(`📦 Large batch detected (${reviewIds.length} reviews), using batch processor`);
      toast.info(`Processing ${reviewIds.length} reviews in batches of 100`, {
        description: "This will prevent browser hangs and ensure smooth processing"
      });

      // Show batch progress dialog
      setShowBatchDialog(true);

      // Notify parent
      if (onCheckStart) {
        onCheckStart(reviewIds);
      }

      // Start batch processing
      await startBatchCheck(reviewIds, {
        batchSize: 100,
        concurrency,
        delayBetweenBatches: 500,
        onComplete: (finalStats) => {
          // Auto-close dialog after 2 seconds to show completion
          setTimeout(() => {
            setShowBatchDialog(false);
          }, 2000);

          if (onCheckComplete) {
            onCheckComplete();
          }
        },
      });

      return;
    }

    // Standard processing for smaller batches (<= 200)
    console.log(`🔍 Standard check for ${reviewIds.length} reviews`);

    // Immediately notify parent for optimistic UI update
    if (onCheckStart) {
      onCheckStart(reviewIds);
    }

    setIsStarting(true);

    try {
      const response = await fetch("/api/automation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewIds, concurrency }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Live check started!");
        if (onCheckComplete) {
          onCheckComplete();
        }
      } else {
        toast.error(data.error || "Failed to start check");
      }
    } catch (error) {
      console.error("Live check error:", error);
      toast.error("Failed to start live check");
    } finally {
      setIsStarting(false);
    }
  };

  const hasSelected = selectedIds.length > 0;
  const isLargeBatch = (count: number) => count > BATCH_THRESHOLD;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isStarting || isProcessing}
            className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300"
          >
            {isStarting || isProcessing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {isProcessing ? "Processing..." : "Starting..."}
              </>
            ) : (
              <>
                <Activity size={16} className="mr-2" />
                Live Check
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-64">
          {hasSelected && (
            <>
              <DropdownMenuItem
                onClick={() => startCheck(selectedIds)}
                disabled={isStarting || isProcessing}
                className="text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <CheckCircle2 size={14} className="mr-2 text-emerald-400" />
                <div className="flex flex-col">
                  <span>Check Selected ({selectedIds.length})</span>
                  {isLargeBatch(selectedIds.length) && (
                    <span className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
                      <Package size={10} />
                      Will use batch processing
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
            </>
          )}
          <DropdownMenuItem
            onClick={() => startCheck(allReviewIds)}
            disabled={isStarting || isProcessing}
            className="text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <Activity size={14} className="mr-2 text-blue-400" />
            <div className="flex flex-col">
              <span>Check All ({allReviewIds.length})</span>
              {isLargeBatch(allReviewIds.length) && (
                <span className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
                  <Package size={10} />
                  Will use batch processing
                </span>
              )}
            </div>
          </DropdownMenuItem>
          {isLargeBatch(allReviewIds.length) && (
            <>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuLabel className="text-xs text-slate-400 font-normal px-2 py-1.5">
                Large batches are split into groups of 100 to prevent browser hangs
              </DropdownMenuLabel>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Batch Progress Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="text-emerald-400" size={20} />
              Batch Processing
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Processing reviews in batches to ensure smooth operation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-slate-300 font-medium">{progress.overallProgress}%</span>
              </div>
              <Progress value={progress.overallProgress} className="h-2" />
              <div className="text-xs text-slate-500">
                {progress.processedReviews} / {progress.totalReviews} reviews
              </div>
            </div>

            {/* Current Batch */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  Batch {progress.currentBatch} of {progress.totalBatches}
                </span>
                <span className="text-slate-300 font-medium">{progress.currentBatchProgress}%</span>
              </div>
              <Progress value={progress.currentBatchProgress} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.live}</div>
                <div className="text-xs text-slate-400">Live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.missing}</div>
                <div className="text-xs text-slate-400">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.error}</div>
                <div className="text-xs text-slate-400">Errors</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-2">
              {progress.status === 'running' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pause}
                  className="flex-1"
                >
                  Pause
                </Button>
              )}
              {progress.status === 'paused' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resume}
                  className="flex-1 border-emerald-600/50 text-emerald-400"
                >
                  Resume
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={stop}
                className="flex-1"
              >
                Stop
              </Button>
            </div>

            {/* Status Message */}
            <div className="text-xs text-center text-slate-500">
              {progress.status === 'running' && 'Processing reviews...'}
              {progress.status === 'paused' && 'Paused (will complete current batch first)'}
              {progress.status === 'completed' && 'All batches completed!'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
