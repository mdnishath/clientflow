import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/lib/hooks";
import { optimisticUpdateReview } from "@/lib/features/reviewsSlice";

export interface Lock {
    reviewId: string;
    userId: string;
    username: string;
    lockedAt: number;
}

export function useReviewLocks() {
    const { data: session } = useSession();
    const currentUser = session?.user || null;
    const [locks, setLocks] = useState<Record<string, Lock>>({});
    const dispatch = useAppDispatch();

    // Initial fetch of locks
    useEffect(() => {
        const fetchLocks = async () => {
            try {
                const res = await fetch("/api/reviews/locks");
                const data = await res.json();
                if (data.success && Array.isArray(data.locks)) {
                    const lockMap: Record<string, Lock> = {};
                    data.locks.forEach((lock: Lock) => {
                        lockMap[lock.reviewId] = lock;
                    });
                    setLocks(lockMap);
                }
            } catch (error) {
                console.error("Failed to fetch locks:", error);
            }
        };

        if (currentUser) {
            fetchLocks();
        }
    }, [currentUser]);

    // SSE Connection for real-time updates
    useEffect(() => {
        if (!currentUser) return;

        let eventSource: EventSource | null = null;

        const connectSSE = () => {
            console.log("🔒 Connecting to Lock SSE...");
            eventSource = new EventSource("/api/automation/sse", {
                withCredentials: true,
            });

            eventSource.addEventListener("lock-update", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // data: { reviewId, isLocked, userId, username, lockedAt }
                    // OR { reviewId, isLocked: false }

                    setLocks((prev) => {
                        const newLocks = { ...prev };
                        if (data.isLocked === false) {
                            delete newLocks[data.reviewId];
                        } else {
                            newLocks[data.reviewId] = {
                                reviewId: data.reviewId,
                                userId: data.userId,
                                username: data.username,
                                lockedAt: data.lockedAt,
                            };
                        }
                        return newLocks;
                    });
                } catch (e) {
                    console.error("Error parsing lock event:", e);
                }
            });

            // Real-time Review Updates
            eventSource.addEventListener("review-updated", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.id) {
                        dispatch(optimisticUpdateReview(data));
                    }
                } catch (e) {
                    console.error("Error parsing review update:", e);
                }
            });
        };

        connectSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [currentUser]);

    const acquireLock = useCallback(async (reviewId: string): Promise<boolean> => {
        if (!currentUser) return false;

        // Check if already locked by someone else
        if (locks[reviewId] && locks[reviewId].userId !== currentUser.id) {
            toast.error(`Locked by ${locks[reviewId].username}`);
            return false;
        }

        try {
            const res = await fetch("/api/reviews/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId }),
            });
            const data = await res.json();

            if (data.success) {
                // Optimistic update
                setLocks((prev) => ({
                    ...prev,
                    [reviewId]: {
                        reviewId,
                        userId: currentUser.id,
                        username: currentUser.name || "Me",
                        lockedAt: Date.now(),
                    },
                }));
                return true;
            } else {
                toast.error(data.error || "Failed to acquire lock");
                return false;
            }
        } catch (error) {
            console.error("Lock error:", error);
            return false;
        }
    }, [currentUser, locks]);

    const releaseLock = useCallback(async (reviewId: string) => {
        if (!currentUser) return;

        // Optimistic remove
        setLocks((prev) => {
            const newLocks = { ...prev };
            delete newLocks[reviewId];
            return newLocks;
        });

        try {
            await fetch("/api/reviews/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId }),
            });
        } catch (error) {
            console.error("Unlock error:", error);
        }
    }, [currentUser]);

    const isLocked = useCallback((reviewId: string) => {
        const lock = locks[reviewId];
        if (!lock) return false;
        return lock.userId !== currentUser?.id;
    }, [locks, currentUser]);

    const getLock = useCallback((reviewId: string) => {
        return locks[reviewId];
    }, [locks]);

    return {
        locks,
        isLocked,
        getLock,
        acquireLock,
        releaseLock,
        currentUser,
    };
}
