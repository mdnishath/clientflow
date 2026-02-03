/**
 * Live Check Button Component
 *
 * Trigger button for starting live checks
 */

"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface LiveCheckButtonProps {
  selectedIds: string[];
  allReviewIds?: string[];
  onCheckStart?: (reviewIds: string[]) => void;
  onCheckComplete?: () => void;
}

export function LiveCheckButton({
  selectedIds,
  allReviewIds = [],
  onCheckStart,
  onCheckComplete,
}: LiveCheckButtonProps) {
  const [isStarting, setIsStarting] = useState(false);

  const startCheck = async (reviewIds: string[]) => {
    if (reviewIds.length === 0) {
      toast.error("No reviews to check");
      return;
    }

    // Immediately notify parent for optimistic UI update
    console.log("⚡ Triggering optimistic update for:", reviewIds);
    if (onCheckStart) {
      onCheckStart(reviewIds);
    }

    setIsStarting(true);

    try {
      const response = await fetch("/api/automation/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewIds }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Live check started!");
        console.log("🚀 Live check started! Triggering immediate refresh...");
        // Trigger immediate refresh to show checking status
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isStarting}
          className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300"
        >
          {isStarting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Activity size={16} className="mr-2" />
              Live Check
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
        {hasSelected && (
          <DropdownMenuItem
            onClick={() => startCheck(selectedIds)}
            disabled={isStarting}
            className="text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <CheckCircle2 size={14} className="mr-2 text-emerald-400" />
            Check Selected ({selectedIds.length})
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => startCheck(allReviewIds)}
          disabled={isStarting}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <Activity size={14} className="mr-2 text-blue-400" />
          Check All ({allReviewIds.length})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
