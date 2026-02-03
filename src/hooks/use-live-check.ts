import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/hooks";
import { updateCheckStatus, startCheckingReviews } from "@/lib/features/reviewsSlice";
import { QueueStats } from "@/lib/automation/types";

// Define the clear states for our machine
export type LiveCheckStatus = "IDLE" | "STARTING" | "RUNNING" | "COMPLETE" | "STOPPING";

export interface UseLiveCheckResult {
    status: LiveCheckStatus;
    stats: QueueStats;
    startChecks: (reviewIds: string[]) => Promise<void>;
    stopChecks: () => Promise<void>;
    reset: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

interface RecentResult {
    reviewId: string;
    status: "LIVE" | "MISSING" | "ERROR";
    completedAt: string;
}

const INITIAL_STATS: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    total: 0,
    liveCount: 0,
    missingCount: 0,
    errorCount: 0,
    isStopped: false,
    progress: 0,
};

export function useLiveCheck(onComplete?: () => void) {
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<LiveCheckStatus>("IDLE");
    const [stats, setStats] = useState<QueueStats>(INITIAL_STATS);
    const [isOpen, setIsOpen] = useState(false);

    // Ref to track if we've already handled the completion for this run
    const hasCompletedRef = useRef(false);
    // Track which reviews we've already dispatched updates for
    const processedResultsRef = useRef<Set<string>>(new Set());

    // Poll for status
    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/automation/status", {
                credentials: "include", // IMPORTANT: Include auth cookies
            });
            const data = await res.json();

            if (data.success && data.stats) {
                setStats(data.stats);

                // OPTIMISTIC UPDATES: Apply individual review updates via Redux
                if (data.recentResults && data.recentResults.length > 0) {
                    data.recentResults.forEach((result: RecentResult) => {
                        if (!processedResultsRef.current.has(result.reviewId)) {
                            console.log(`⚡ Optimistic update: ${result.reviewId} → ${result.status}`);
                            dispatch(updateCheckStatus({
                                id: result.reviewId,
                                checkStatus: result.status,
                                lastCheckedAt: result.completedAt,
                            }));
                            processedResultsRef.current.add(result.reviewId);
                        }
                    });
                }

                // LOGIC: Determine status based on pure stats
                const isActive = data.stats.processing > 0 || data.stats.pending > 0;

                if (isActive) {
                    if (status !== "RUNNING") setStatus("RUNNING");
                    hasCompletedRef.current = false;
                } else {
                    // No active jobs...
                    if (data.stats.total > 0 && !hasCompletedRef.current) {
                        // We have results and just finished!
                        console.log("✅ Live Check Completed!");
                        setStatus("COMPLETE");
                        hasCompletedRef.current = true;
                        toast.success(`Checks complete: ${data.stats.liveCount} live, ${data.stats.missingCount} missing`);
                        onComplete?.();
                    } else if (data.stats.total === 0) {
                        // Reset to IDLE if no data at all
                        if (status !== "IDLE" && status !== "STARTING") setStatus("IDLE");
                    }
                }
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    }, [status, dispatch, onComplete]);

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === "STARTING" || status === "RUNNING") {
            // Poll every 2 seconds
            interval = setInterval(checkStatus, 2000);
        } else if (status === "STOPPING") {
            // Poll fast to catch the stop
            interval = setInterval(checkStatus, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, checkStatus]);

    // Start Function
    const startChecks = async (reviewIds: string[]) => {
        if (reviewIds.length === 0) return;

        setStatus("STARTING");
        setIsOpen(true); // Auto-open panel when starting
        hasCompletedRef.current = false;
        processedResultsRef.current.clear(); // Clear processed results for new run

        // Optimistically mark reviews as CHECKING in Redux
        dispatch(startCheckingReviews(reviewIds));
        reviewIds.forEach(id => {
            dispatch(updateCheckStatus({
                id,
                checkStatus: "CHECKING",
            }));
        });

        try {
            // 1. Send start request with credentials
            const res = await fetch("/api/automation/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // IMPORTANT: Include auth cookies
                body: JSON.stringify({ reviewIds }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Start checks failed:", res.status, errorData);
                throw new Error(errorData.error || "Failed to start checks");
            }

            const data = await res.json();
            console.log("✅ Checks started:", data);

            // 2. Immediate status check to update UI
            await checkStatus();

        } catch (error) {
            console.error("Failed to start checks:", error);
            toast.error(error instanceof Error ? error.message : "Failed to start checks");
            setStatus("IDLE");
        }
    };

    // Stop Function
    const stopChecks = async () => {
        setStatus("STOPPING");
        try {
            await fetch("/api/automation/stop", {
                method: "POST",
                credentials: "include",
            });
            toast.info("Stopping checks...");
            // The polling will eventually catch the 'isStopped' state or 0 active jobs
        } catch (error) {
            console.error("Failed to stop:", error);
        }
    };

    const reset = () => {
        setStatus("IDLE");
        setStats(INITIAL_STATS);
        setIsOpen(false);
        processedResultsRef.current.clear();
    };

    return {
        status,
        stats,
        startChecks,
        stopChecks,
        reset,
        isOpen,
        setIsOpen
    };
}
