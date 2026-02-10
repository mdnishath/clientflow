import { automationEvents } from "./events";

interface Lock {
    userId: string;
    username: string; // Display name for UI
    reviewId: string;
    lockedAt: number; // Timestamp
}

export class LockManager {
    private locks = new Map<string, Lock>(); // ReviewId -> Lock
    private readonly LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    private cleanupInterval?: NodeJS.Timeout; // FIX: Store interval for cleanup

    constructor() {
        // Periodically clean up stale locks
        if (typeof setInterval !== "undefined") {
            // FIX: Store interval reference to prevent memory leak
            this.cleanupInterval = setInterval(() => this.cleanupStaleLocks(), 60 * 1000);
        }
    }

    /**
     * Cleanup method to prevent memory leaks
     * Call this when LockManager is no longer needed
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
        this.locks.clear();
    }

    /**
     * Try to acquire a lock on a review
     */
    acquire(reviewId: string, userId: string, username: string): { success: boolean; lockedBy?: string } {
        const existingLock = this.locks.get(reviewId);

        // 1. Enforce One Lock Per User: Release any OTHER lock held by this user
        for (const [id, lock] of this.locks.entries()) {
            if (lock.userId === userId && id !== reviewId) {
                // Auto-release previous lock
                this.release(id, userId);
            }
        }

        // If locked by someone else and not expired
        if (existingLock && existingLock.userId !== userId) {
            if (Date.now() - existingLock.lockedAt < this.LOCK_TIMEOUT_MS) {
                return { success: false, lockedBy: existingLock.username };
            }
            // Stale lock, can overwrite
        }

        // Acquire or refresh lock
        const newLock: Lock = {
            userId,
            username,
            reviewId,
            lockedAt: Date.now(),
        };
        this.locks.set(reviewId, newLock);

        // Broadcast lock update
        automationEvents.emit("lock-update", {
            reviewId: newLock.reviewId,
            isLocked: true,
            userId: newLock.userId,
            username: newLock.username,
            lockedAt: newLock.lockedAt,
        });

        return { success: true };
    }

    /**
     * Release a lock
     */
    release(reviewId: string, userId: string): boolean {
        const existingLock = this.locks.get(reviewId);

        // Only allow owner to release
        if (existingLock && existingLock.userId === userId) {
            this.locks.delete(reviewId);

            // Broadcast unlock
            automationEvents.emit("lock-update", {
                reviewId,
                isLocked: false,
            });
            return true;
        }
        return false;
    }

    /**
     * Force release (Admin/System)
     */
    forceRelease(reviewId: string) {
        this.locks.delete(reviewId);
        automationEvents.emit("lock-update", {
            reviewId,
            isLocked: false,
        });
    }

    /**
     * Get specific lock
     */
    getLock(reviewId: string): Lock | undefined {
        return this.locks.get(reviewId);
    }

    /**
     * Get all active locks
     */
    getAllLocks(): Lock[] {
        this.cleanupStaleLocks(); // Clean before returning
        return Array.from(this.locks.values());
    }

    /**
     * Remove expired locks
     */
    private cleanupStaleLocks() {
        const now = Date.now();
        for (const [reviewId, lock] of this.locks.entries()) {
            if (now - lock.lockedAt > this.LOCK_TIMEOUT_MS) {
                this.locks.delete(reviewId);
                // Broadcast expiration
                automationEvents.emit("lock-update", {
                    reviewId,
                    isLocked: false,
                });
            }
        }
    }
}

// Singleton Pattern for HMR support
const globalForLocks = global as unknown as { lockManager: LockManager };
export const lockManager = globalForLocks.lockManager || new LockManager();
if (process.env.NODE_ENV !== "production") globalForLocks.lockManager = lockManager;
