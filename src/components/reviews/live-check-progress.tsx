"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ChevronUp,
  Loader2,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueueStats } from "@/lib/automation/types";
import { LiveCheckStatus } from "@/hooks/use-live-check";

interface LiveCheckProgressProps {
  stats: QueueStats;
  status: LiveCheckStatus;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onStop: () => void;
  onReset: () => void;
}

export function LiveCheckProgress({
  stats,
  status,
  isOpen,
  onToggle,
  onStop,
  onReset,
}: LiveCheckProgressProps) {
  const isActive = status === "STARTING" || status === "RUNNING";
  const isComplete = status === "COMPLETE";
  const hasData = stats.total > 0;

  // Don't show anything if no data and not active
  if (!hasData && !isActive) {
    return null;
  }

  // Calculate percentages for chart
  const total = stats.liveCount + stats.missingCount + stats.errorCount;
  const livePercent = total > 0 ? (stats.liveCount / total) * 100 : 0;
  const missingPercent = total > 0 ? (stats.missingCount / total) * 100 : 0;
  const errorPercent = total > 0 ? (stats.errorCount / total) * 100 : 0;

  // Minimized floating button (bottom right)
  if (!isOpen) {
    return (
      <button
        onClick={() => onToggle(true)}
        className={`
                    fixed bottom-6 right-6 z-50
                    flex items-center gap-2 px-4 py-3 rounded-full
                    shadow-lg shadow-black/30 border
                    transition-all duration-300 hover:scale-105
                    ${isActive
            ? "bg-indigo-600 border-indigo-500 text-white animate-pulse"
            : isComplete
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }
                `}
      >
        {isActive ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Activity size={18} />
        )}
        <span className="font-medium tabular-nums">
          {isActive ? `${stats.completed}/${stats.total}` : `${stats.liveCount}/${total}`}
        </span>
        {/* Mini stats */}
        {!isActive && total > 0 && (
          <div className="flex items-center gap-1 pl-2 border-l border-white/20">
            <span className="text-green-300">{stats.liveCount}</span>
            <span className="text-red-300">{stats.missingCount}</span>
          </div>
        )}
        <ChevronUp size={16} className="ml-1" />
      </button>
    );
  }

  // Full panel (floating bottom right)
  return (
    <Card className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border-slate-700 shadow-2xl shadow-black/50">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isActive ? (
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Loader2 size={18} className="text-white animate-spin" />
              </div>
            ) : isComplete ? (
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-white" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Activity size={18} className="text-slate-400" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-white text-sm">
                {isActive ? "Checking..." : isComplete ? "Complete!" : "Live Check"}
              </h4>
              <p className="text-slate-500 text-xs">
                {isActive
                  ? `${stats.pending} pending, ${stats.processing} active`
                  : `${total} total checked`
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(false)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Progress Bar (when active) */}
        {isActive && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span className="tabular-nums">{stats.progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-green-500/10 rounded-lg p-2 text-center border border-green-500/20">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
              <CheckCircle2 size={14} />
            </div>
            <div className="text-lg font-bold text-green-400 tabular-nums">
              {stats.liveCount}
            </div>
            <div className="text-xs text-green-400/70">Live</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
            <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
              <XCircle size={14} />
            </div>
            <div className="text-lg font-bold text-red-400 tabular-nums">
              {stats.missingCount}
            </div>
            <div className="text-xs text-red-400/70">Missing</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 text-center border border-orange-500/20">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <AlertTriangle size={14} />
            </div>
            <div className="text-lg font-bold text-orange-400 tabular-nums">
              {stats.errorCount}
            </div>
            <div className="text-xs text-orange-400/70">Error</div>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        {total > 0 && (
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2">Distribution</div>
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-800">
              {livePercent > 0 && (
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${livePercent}%` }}
                  title={`Live: ${stats.liveCount}`}
                />
              )}
              {missingPercent > 0 && (
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${missingPercent}%` }}
                  title={`Missing: ${stats.missingCount}`}
                />
              )}
              {errorPercent > 0 && (
                <div
                  className="bg-orange-500 transition-all duration-500"
                  style={{ width: `${errorPercent}%` }}
                  title={`Error: ${stats.errorCount}`}
                />
              )}
            </div>
            {/* Percentage labels */}
            <div className="flex justify-between text-xs mt-1">
              {livePercent > 0 && (
                <span className="text-green-400">{Math.round(livePercent)}%</span>
              )}
              {missingPercent > 0 && (
                <span className="text-red-400">{Math.round(missingPercent)}%</span>
              )}
              {errorPercent > 0 && (
                <span className="text-orange-400">{Math.round(errorPercent)}%</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <StopCircle size={14} className="mr-2" />
            Stop Checks
          </Button>
        )}

        {/* Completed Summary */}
        {isComplete && (
          <div className="space-y-3">
            <div className="text-center text-sm text-slate-400">
              <span className="text-green-400 font-medium">{stats.liveCount}</span> live, {" "}
              <span className="text-red-400 font-medium">{stats.missingCount}</span> missing
              {stats.errorCount > 0 && (
                <>, <span className="text-orange-400 font-medium">{stats.errorCount}</span> errors</>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Clear & Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
