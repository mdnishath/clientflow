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
    startChecks: (reviewIds: string[], concurrency?: number) => Promise<void>;
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
    doneCount: 0,
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

    // Ref to track status inside event listeners without triggering re-connects
    const statusRef = useRef(status);
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Initial Status Check (Sync state on mount)
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/automation/status");
            const data = await res.json();
            if (data.success && data.stats) {
                setStats(data.stats);
                const isActive = data.stats.processing > 0 || data.stats.pending > 0;

                // Only update status if meaningful change (avoid jitter)
                if (isActive) {
                    if (statusRef.current !== "RUNNING") {
                        setStatus("RUNNING");
                        setIsOpen(true);
                    }
                } else if (data.stats.total > 0 && data.stats.pending === 0 && data.stats.processing === 0) {
                    // Check if we just finished
                    if (statusRef.current === "RUNNING") {
                        setStatus("COMPLETE");
                        hasCompletedRef.current = true;
                    }
                }
            }
        } catch (error) {
            console.error("Status check failed:", error);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // POLLING FALLBACK: For production environments where SSE might be buffered or multi-process
    useEffect(() => {
        if (status === "RUNNING" || status === "STARTING") {
            const interval = setInterval(fetchStatus, 2000); // Poll every 2s
            return () => clearInterval(interval);
        }
    }, [status, fetchStatus]);

    // SSE Connection Effect
    useEffect(() => {
        let eventSource: EventSource | null = null;

        const connectSSE = () => {
            if (eventSource) return;

            console.log("🔌 Connecting to SSE...");
            eventSource = new EventSource("/api/automation/sse", {
                withCredentials: true,
            });

            eventSource.onopen = () => {
                console.log("🟢 SSE Connected");
            };

            eventSource.onerror = (err) => {
                // Only log error if not closed explicitly
                if (eventSource?.readyState !== EventSource.CLOSED) {
                    console.error("🔴 SSE Error:", err);
                    eventSource?.close();
                }
            };

            eventSource.addEventListener("stats", (event) => {
                try {
                    const newStats = JSON.parse(event.data);
                    setStats(newStats);

                    const isActive = newStats.processing > 0 || newStats.pending > 0;
                    const currentStatus = statusRef.current;

                    if (isActive) {
                        if (currentStatus === "IDLE" || currentStatus === "COMPLETE") {
                            setStatus("RUNNING");
                            hasCompletedRef.current = false;
                        }
                    } else {
                        if (newStats.total > 0 && !hasCompletedRef.current) {
                            console.log("✅ Live Check Completed (SSE)");
                            setStatus("COMPLETE");
                            hasCompletedRef.current = true;
                            toast.success(`Checks complete: ${newStats.doneCount} done, ${newStats.liveCount} live, ${newStats.missingCount} missing`);
                            onComplete?.();
                        } else if (newStats.total === 0) {
                            if (currentStatus !== "IDLE" && currentStatus !== "STARTING") {
                                setStatus("IDLE");
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing stats event:", e);
                }
            });

            eventSource.addEventListener("result", (event) => {
                try {
                    const result = JSON.parse(event.data);
                    console.log(`⚡ SSE Result: ${result.reviewId} → ${result.status}`);
                    dispatch(updateCheckStatus({
                        id: result.reviewId,
                        checkStatus: result.status,
                        lastCheckedAt: result.completedAt,
                    }));
                } catch (e) {
                    console.error("Error parsing result event:", e);
                }
            });

            eventSource.addEventListener("system-complete", () => {
                console.log("🏁 System reported completion");
                setStatus("COMPLETE");
                hasCompletedRef.current = true;
                toast.success("Checks complete!");
                onComplete?.();
            });
        };

        connectSSE();

        return () => {
            if (eventSource) {
                console.log("🔌 Closing SSE connection");
                eventSource.close();
                eventSource = null;
            }
        };
    }, [dispatch, onComplete]); // Removed 'status' dependency

    // Start Function - accepts optional concurrency (3, 5, or 10)
    const startChecks = async (reviewIds: string[], concurrency?: number) => {
        if (reviewIds.length === 0) return;

        setStatus("STARTING");
        setIsOpen(true); // Auto-open panel when starting
        hasCompletedRef.current = false;

        // Optimistically mark reviews as CHECKING in Redux
        dispatch(startCheckingReviews(reviewIds));
        reviewIds.forEach(id => {
            dispatch(updateCheckStatus({
                id,
                checkStatus: "CHECKING",
            }));
        });

        try {
            // Send start request
            const res = await fetch("/api/automation/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reviewIds, concurrency }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Start checks failed:", res.status, errorData);
                throw new Error(errorData.error || "Failed to start checks");
            }

            console.log("✅ Checks started command sent");
            // SSE will handle the updates

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
        } catch (error) {
            console.error("Failed to stop:", error);
        }
    };

    const reset = async () => {
        setStatus("IDLE");
        setStats(INITIAL_STATS);
        setIsOpen(false);
        processedResultsRef.current.clear();

        try {
            await fetch("/api/automation/reset", {
                method: "POST",
                credentials: "include",
            });
            toast.success("Check queue cleared");
        } catch (error) {
            console.error("Failed to reset queue:", error);
        }
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
