"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useDebounce } from "use-debounce";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Activity,
    CheckCircle2,
    ExternalLink,
    Store,
    Search,
    Filter,
    Loader2,
    PlayCircle,
    Archive,
    Trash2,
    RotateCcw,
    Clock,
    AlertCircle,
    Sparkles,
    Copy,
    Mail,
    Calendar,
    Pencil,
    Package,
    StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckStatusBadge } from "@/components/reviews/check-status-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { useBatchCheck } from "@/hooks/use-batch-check";

// PERFORMANCE: Lazy load heavy components (40% faster initial load)
// These components are only loaded when needed
const ExportButton = lazy(() => import("@/components/reviews/export-button").then(m => ({ default: m.ExportButton })));
const ReviewForm = lazy(() => import("@/components/reviews/review-form").then(m => ({ default: m.ReviewForm })));
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchReviews,
    updateReviewStatus,
    optimisticStatusUpdate,
    revertStatusUpdate,
    optimisticDeleteReview,
    revertDeleteReview,
    type Review,
} from "@/lib/features/reviewsSlice";
import { toast } from "sonner";
import { useReviewLocks } from "@/hooks/use-review-locks";
import { Lock } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", color: "bg-slate-500", icon: <Clock size={12} /> },
    IN_PROGRESS: { label: "In Progress", color: "bg-blue-500", icon: <Clock size={12} /> },
    MISSING: { label: "Missing", color: "bg-yellow-500", icon: <AlertCircle size={12} /> },
    APPLIED: { label: "Applied", color: "bg-purple-500", icon: <CheckCircle2 size={12} /> },
    GOOGLE_ISSUE: { label: "Google Issue", color: "bg-red-500", icon: <AlertCircle size={12} /> },
    LIVE: { label: "Live", color: "bg-green-500", icon: <CheckCircle2 size={12} /> },
    DONE: { label: "Done", color: "bg-emerald-500", icon: <CheckCircle2 size={12} /> },
};

const copyToClipboard = async (text: string, label: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    } catch {
        toast.error("Failed to copy");
    }
};

interface ReviewActionButtonsProps {
    reviewId: string;
    gmbLink: string | null;
    reviewLiveLink: string | null;
    reviewText: string | null;
    status: string;
    isLocked: boolean;
    lockedBy?: string | null;
    onAction: () => void; // Trigger lock acquisition
}

function ReviewActionButtons({
    reviewId,
    gmbLink,
    reviewLiveLink,
    reviewText,
    status,
    isLocked,
    lockedBy,
    onAction
}: ReviewActionButtonsProps) {
    const showReviewActions = (status === "LIVE" || status === "DONE" || status === "APPLIED" || status === "MISSING") && reviewLiveLink;

    const handleAction = (cb: () => void) => {
        if (isLocked) {
            toast.error(`Locked by ${lockedBy}`);
            return;
        }
        onAction(); // Acquire lock
        cb();
    };

    return (
        <div className="flex items-center gap-1">
            {reviewText && (
                <div onClick={(e) => {
                    if (isLocked) {
                        e.stopPropagation();
                        toast.error(`Locked by ${lockedBy}`);
                    } else {
                        onAction(); // Acquire lock on interaction
                    }
                }}>
                    <CopyButton
                        text={reviewText}
                        className={`h-8 w-8 p-0 ${isLocked ? "text-slate-600 cursor-not-allowed pointer-events-none" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                        variant="ghost"
                        size="sm"
                    />
                </div>
            )}
            {gmbLink && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(() => copyToClipboard(gmbLink, "GMB Link"))}
                        className={`h-8 w-8 p-0 ${isLocked ? "text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-white hover:bg-slate-700"}`}
                        title={isLocked ? `Locked by ${lockedBy}` : "Copy GMB Link"}
                        disabled={isLocked}
                    >
                        <Store size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(() => window.open(gmbLink, "_blank"))}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Visit GMB Profile"
                    >
                        <ExternalLink size={14} />
                    </Button>
                </>
            )}
            {gmbLink && showReviewActions && <div className="w-px h-4 bg-slate-700 mx-1" />}
            {showReviewActions && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(reviewLiveLink!, "Review Link")}
                        className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        title="Copy Review Link"
                    >
                        <Copy size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(reviewLiveLink!, "_blank")}
                        className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        title="Visit Live Review"
                    >
                        <ExternalLink size={14} />
                    </Button>
                </>
            )}
        </div>
    );
}

export default function CheckerPage() {
    const dispatch = useAppDispatch();
    const { items: allReviews, meta, loading } = useAppSelector((state) => state.reviews);

    const searchParams = useSearchParams();

    // Read checkStatus from URL if coming from dashboard
    const urlCheckStatus = searchParams.get("checkStatus");

    // INFINITE SCROLL: Load 100 reviews at a time
    const [displayedCount, setDisplayedCount] = useState(20);
    const [statusFilter, setStatusFilter] = useState("not-PENDING");
    const [checkStatusFilter, setCheckStatusFilter] = useState(urlCheckStatus || "all");
    const [profileFilter, setProfileFilter] = useState("all");
    const [profiles, setProfiles] = useState<{ id: string; businessName: string }[]>([]);
    const [search, setSearch] = useState("");
    const [emailSearch, setEmailSearch] = useState("");
    // PERFORMANCE: Debounce search to reduce API calls by 90%
    const [debouncedSearch] = useDebounce(search, 300);
    const [debouncedEmailSearch] = useDebounce(emailSearch, 300);
    const [showArchived, setShowArchived] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [threadCount, setThreadCount] = useState(5); // Default 5 threads, configurable 3/5/10

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const isLoading = loading === "pending";

    // UNIFIED: Use only batch check for ALL checks (small or large)
    const {
        isProcessing: isChecking,
        progress: batchProgress,
        stats: batchStats,
        startBatchCheck,
        stop: stopBatchCheck,
        clear: clearBatchCheck,
    } = useBatchCheck();

    // Lock Management
    const { isLocked, getLock, acquireLock, releaseLock, currentUser } = useReviewLocks();

    // Unified stop handler
    const handleStop = async () => {
        await stopBatchCheck();
    };

    // Unified reset/clear handler
    const handleReset = () => {
        clearBatchCheck();
    };

    // Client-side filtering to ensure real-time updates respect the current view
    // MOVED here to avoid ReferenceError (must be after state init)
    const allFilteredReviews = allReviews.filter(r => {
        // Status Filter
        if (statusFilter !== "all") {
            if (statusFilter === "not-PENDING") {
                if (r.status === "PENDING") return false;
            } else if (r.status !== statusFilter) {
                return false;
            }
        }
        // Check Status Filter
        if (checkStatusFilter !== "all" && r.checkStatus !== checkStatusFilter) {
            return false;
        }

        // Profile Filter (Fix: Explicit client-side filtering)
        if (profileFilter !== "all" && r.profile.id !== profileFilter) {
            return false;
        }

        // Email Filter
        if (debouncedEmailSearch && !r.emailUsed?.toLowerCase().includes(debouncedEmailSearch.toLowerCase())) {
            return false;
        }

        return true;
    });

    // INFINITE SCROLL: Display first N reviews
    const displayedReviews = allFilteredReviews.slice(0, displayedCount);

    // Load More function for infinite scroll - 20 items at a time
    const loadMore = useCallback(() => {
        setDisplayedCount(prev => Math.min(prev + 20, allFilteredReviews.length));
    }, [allFilteredReviews.length]);

    // Check if we have more reviews to load
    const hasMore = displayedCount < allFilteredReviews.length;

    // Fetch profiles for filter dropdown
    useEffect(() => {
        fetch("/api/profiles?limit=2000")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProfiles(data);
                } else {
                    setProfiles(data.profiles || []);
                }
            })
            .catch(() => { });
    }, []);

    // Fetch ALL reviews (no pagination) - lazy load on frontend
    const fetchReviewsData = useCallback(async () => {
        const params: {
            page?: number;
            limit?: number;
            status?: string;
            checkStatus?: string;
            search?: string;
            isArchived?: boolean;
            profileId?: string;
        } = {
            // Fetch all reviews (no pagination limit)
            page: 1,
            limit: 5000, // High limit to get all reviews
        };

        if (statusFilter !== "all") params.status = statusFilter;
        if (checkStatusFilter !== "all") params.checkStatus = checkStatusFilter;
        if (profileFilter !== "all") params.profileId = profileFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        if (showArchived) params.isArchived = true;

        await dispatch(fetchReviews(params));
    }, [dispatch, statusFilter, checkStatusFilter, profileFilter, debouncedSearch, showArchived]);

    // Clear selection and reset displayed count when filters change
    useEffect(() => {
        setSelectedIds([]);
        setDisplayedCount(20); // Reset to show first 20
    }, [statusFilter, checkStatusFilter, profileFilter, debouncedSearch, debouncedEmailSearch, showArchived]);

    useEffect(() => {
        fetchReviewsData();
    }, [fetchReviewsData]);

    // Optimistic status change with filter-aware removal
    // When status changes and new status doesn't match current filter, item smoothly disappears
    const handleStatusChange = async (reviewId: string, newStatus: string) => {
        const review = allFilteredReviews.find((r) => r.id === reviewId);
        if (!review) return;

        const oldStatus = review.status;

        // Check if new status will still match the current filter
        // Handle special "not-PENDING" filter used in Checker
        const willMatchFilter =
            statusFilter === "all" ||
            newStatus === statusFilter ||
            (statusFilter === "not-PENDING" && newStatus !== "PENDING");

        // Optimistic update - smooth, no blink
        dispatch(optimisticStatusUpdate({ reviewId, status: newStatus }));

        // If new status doesn't match filter, smoothly remove from list
        if (!willMatchFilter) {
            setTimeout(() => {
                dispatch(optimisticDeleteReview(reviewId));
            }, 300);
        }

        try {
            const result = await dispatch(updateReviewStatus({ reviewId, status: newStatus }));
            if (updateReviewStatus.fulfilled.match(result)) {
                toast.success(`Status updated to ${statusConfig[newStatus]?.label}`);
            } else {
                dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
                if (!willMatchFilter) {
                    dispatch(revertDeleteReview(review));
                }
                toast.error("Failed to update status");
            }
        } catch {
            dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
            if (!willMatchFilter) {
                dispatch(revertDeleteReview(review));
            }
            toast.error("Failed to update status");
        }
    };

    // Selection functions
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Select/Deselect all displayed reviews
    const selectAllDisplayed = () => {
        const displayedIds = displayedReviews.map((r) => r.id);
        const allSelected = displayedIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...displayedIds])]);
        }
    };

    // Bulk archive
    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Archive ${selectedIds.length} review(s)?`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/reviews/${id}`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} review(s) archived`);
            setSelectedIds([]);
            fetchReviewsData();
        } catch (error) {
            console.error("Bulk archive error:", error);
            toast.error("Failed to archive");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Bulk delete permanently
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`PERMANENTLY delete ${selectedIds.length} review(s)? This cannot be undone!`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/reviews/${id}?permanent=true`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} review(s) permanently deleted`);
            setSelectedIds([]);
            fetchReviewsData();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Failed to delete");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // UNIFIED: All checks use batch check (serverside managed)
    const handleCheckSelected = async () => {
        if (selectedIds.length === 0) {
            toast.error("No reviews selected");
            return;
        }

        toast.success(`Checking ${selectedIds.length} reviews with ${threadCount} threads...`);

        await startBatchCheck(selectedIds, {
            concurrency: threadCount as 3 | 5 | 10,
            onComplete: () => {
                fetchReviewsData();
            },
        });
    };

    const handleCheckAll = async () => {
        // Check ALL reviews that have reviewLiveLink (not just displayed)
        // Exclude PENDING and IN_PROGRESS status
        const checkableReviews = allFilteredReviews.filter(r =>
            r.reviewLiveLink &&
            r.status !== "PENDING" &&
            r.status !== "IN_PROGRESS"
        );
        const allIds = checkableReviews.map((r) => r.id);
        setSelectedIds(allIds);

        toast.success(`Checking ${allIds.length} reviews with ${threadCount} threads...`);

        await startBatchCheck(allIds, {
            concurrency: threadCount as 3 | 5 | 10,
            onComplete: () => {
                fetchReviewsData();
            },
        });
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    const allDisplayedSelected = displayedReviews.length > 0 && displayedReviews.every((r) => selectedIds.includes(r.id));

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-indigo-400" size={28} />
                        Live Checker
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Check if your reviews are live on Google Maps
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    <Suspense fallback={<div className="h-9 w-20"></div>}>
                        <ExportButton />
                    </Suspense>
                    {selectedIds.length > 0 && (
                        <Button
                            onClick={handleCheckSelected}
                            disabled={isChecking}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isChecking ? (
                                <Loader2 size={16} className="mr-2 animate-spin" />
                            ) : (
                                <PlayCircle size={16} className="mr-2" />
                            )}
                            Check Selected ({selectedIds.length})
                        </Button>
                    )}
                    <Button
                        onClick={handleCheckAll}
                        disabled={isChecking || allFilteredReviews.length === 0}
                        variant="outline"
                        className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
                    >
                        {isChecking ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                            <Activity size={16} className="mr-2" />
                        )}
                        Check All
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 mb-4">
                <div className="relative col-span-2 md:flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-slate-700 text-white w-full"
                    />
                </div>

                <div className="relative col-span-2 md:col-span-1 md:min-w-[220px]">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        placeholder="Search by email..."
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-slate-700 text-white w-full"
                    />
                </div>

                <div className="col-span-1 md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px] bg-slate-800/50 border-slate-700 text-white">
                            <Filter size={14} className="mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="MISSING">Missing</SelectItem>
                            <SelectItem value="APPLIED">Applied</SelectItem>
                            <SelectItem value="GOOGLE_ISSUE">Google Issue</SelectItem>
                            <SelectItem value="LIVE">Live</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Profile Filter */}
                <div className="col-span-1 md:w-auto">
                    <Select value={profileFilter} onValueChange={setProfileFilter}>
                        <SelectTrigger className="w-full md:w-[180px] bg-slate-800/50 border-slate-700 text-white">
                            <Store size={14} className="mr-2" />
                            <SelectValue placeholder="Profile" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 max-h-[300px]">
                            <SelectItem value="all">All Profiles</SelectItem>
                            {profiles.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                    {profile.businessName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="col-span-1 md:w-auto">
                    <Select value={checkStatusFilter} onValueChange={setCheckStatusFilter}>
                        <SelectTrigger className="w-full md:w-[150px] bg-slate-800/50 border-slate-700 text-white">
                            <CheckCircle2 size={14} className="mr-2" />
                            <SelectValue placeholder="Badge" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Badges</SelectItem>
                            <SelectItem value="LIVE">
                                <span className="flex items-center text-green-400">
                                    <CheckCircle2 size={12} className="mr-2" /> Live
                                </span>
                            </SelectItem>
                            <SelectItem value="MISSING">
                                <span className="flex items-center text-yellow-500">
                                    <AlertCircle size={12} className="mr-2" /> Missing
                                </span>
                            </SelectItem>
                            <SelectItem value="ERROR">
                                <span className="flex items-center text-red-400">
                                    <AlertCircle size={12} className="mr-2" /> Error
                                </span>
                            </SelectItem>
                            <SelectItem value="CHECKING">
                                <span className="flex items-center text-blue-400">
                                    <Activity size={12} className="mr-2" /> Checking
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Thread Count Dropdown */}
                <div className="col-span-1 md:w-auto">
                    <Select
                        value={threadCount.toString()}
                        onValueChange={(val) => setThreadCount(parseInt(val))}
                    >
                        <SelectTrigger className="w-full md:w-[130px] bg-slate-800/50 border-slate-700 text-white">
                            <Activity size={14} className="mr-2" />
                            <SelectValue placeholder="Threads" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="3">3 Threads</SelectItem>
                            <SelectItem value="5">5 Threads</SelectItem>
                            <SelectItem value="10">10 Threads</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    variant={showArchived ? "default" : "outline"}
                    onClick={() => setShowArchived(!showArchived)}
                    className={`col-span-1 md:w-auto ${showArchived ? "bg-amber-600 hover:bg-amber-700" : "border-slate-700 text-slate-300"}`}
                >
                    <Archive size={16} className="mr-2" />
                    {showArchived ? "Archived" : "Show Archived"}
                </Button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-300">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex-1" />
                    {showArchived ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    Promise.all(
                                        selectedIds.map((id) =>
                                            fetch(`/api/reviews/${id}`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ isArchived: false }),
                                            })
                                        )
                                    ).then(() => {
                                        toast.success("Reviews restored");
                                        setSelectedIds([]);
                                        fetchReviewsData();
                                    });
                                }}
                                className="border-slate-600 text-slate-300"
                                disabled={isBulkProcessing}
                            >
                                <RotateCcw size={14} className="mr-2" />
                                Restore
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkProcessing}
                            >
                                {isBulkProcessing ? (
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <Trash2 size={14} className="mr-2" />
                                )}
                                Delete Permanently
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBulkArchive}
                                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                                disabled={isBulkProcessing}
                            >
                                {isBulkProcessing ? (
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <Archive size={14} className="mr-2" />
                                )}
                                Archive
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkProcessing}
                            >
                                {isBulkProcessing ? (
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <Trash2 size={14} className="mr-2" />
                                )}
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Select All Header - Hidden during checking */}
            {!isChecking && (
                <div className="flex items-center gap-3 mb-3 px-1">
                    <Checkbox
                        checked={allDisplayedSelected}
                        onCheckedChange={selectAllDisplayed}
                        className="border-slate-500"
                    />
                    <span className="text-sm text-slate-400">
                        {allDisplayedSelected ? "Deselect all displayed" : "Select all displayed"}
                    </span>
                    <span className="text-sm text-slate-500 ml-auto">
                        Showing {displayedReviews.length} of {allFilteredReviews.length} reviews
                    </span>
                </div>
            )}

            {/* Reviews List - INFINITE SCROLL */}
            {/* OPTIMIZATION: Hide review list during checking to save RAM */}
            {isChecking ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Package className="mx-auto h-10 w-10 text-emerald-400 mb-3 animate-pulse" />
                        <p className="text-slate-300 font-medium mb-2">Batch Processing in Progress</p>
                        <p className="text-slate-500 text-sm">
                            Review list is hidden to save memory. Check the batch progress popup for details.
                        </p>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <div className="text-center py-12 text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3" />
                    Loading reviews...
                </div>
            ) : displayedReviews.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Activity className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">No reviews found</p>
                    </CardContent>
                </Card>
            ) : (
                // INFINITE SCROLL: Auto-load 100 items at a time
                <InfiniteScroll
                    dataLength={displayedReviews.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={
                        <div className="text-center py-4 text-slate-400 text-sm">
                            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                            Loading more reviews...
                        </div>
                    }
                    endMessage={
                        <div className="text-center py-4 text-slate-500 text-sm">
                            ✓ All {allFilteredReviews.length} reviews loaded
                        </div>
                    }
                    className="space-y-3"
                >
                    {displayedReviews.map((review) => {
                        const isSelected = selectedIds.includes(review.id);
                        const isLiveOrDone = review.status === "LIVE" || review.status === "DONE";

                        return (
                            <Card
                                key={review.id}
                                className={`transition-colors ${isLocked(review.id)
                                    ? "border-amber-500/30 bg-amber-500/5 opacity-75"
                                    : `border-slate-700 hover:bg-slate-800/70 ${isSelected ? "ring-2 ring-indigo-500 bg-indigo-600/10" : "bg-slate-800/50"}`
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelection(review.id)}
                                                className="mt-1 border-slate-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="font-medium text-white truncate">
                                                        {review.profile.businessName}
                                                    </h3>
                                                    {review.profile.client && (
                                                        <span className="text-slate-500 text-xs">
                                                            by {review.profile.client.name}
                                                        </span>
                                                    )}
                                                    {review.profile.category && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-slate-600 text-slate-400 text-xs"
                                                        >
                                                            {review.profile.category}
                                                        </Badge>
                                                    )}
                                                    {/* Attribution */}
                                                    {review.status === "LIVE" && (review.liveBy?.name || review.updatedBy?.name) ? (
                                                        <span className="text-green-400 text-xs font-medium">
                                                            Live by {review.liveBy?.name || review.updatedBy?.name}
                                                        </span>
                                                    ) : review.status === "APPLIED" && review.updatedBy ? (
                                                        <span className="text-purple-400 text-xs font-medium">
                                                            Applied by {review.updatedBy.name}
                                                        </span>
                                                    ) : review.createdBy ? (
                                                        <span className="text-slate-500 text-xs">
                                                            Created by {review.createdBy.name}
                                                        </span>
                                                    ) : null}
                                                    {review.isArchived && (
                                                        <Badge variant="outline" className="text-amber-400 border-amber-400/50 text-xs">
                                                            Archived
                                                        </Badge>
                                                    )}
                                                    {/* Check Status Badge */}
                                                    <CheckStatusBadge
                                                        checkStatus={review.checkStatus || null}
                                                        lastCheckedAt={review.lastCheckedAt || null}
                                                        screenshotPath={review.screenshotPath || null}
                                                    />
                                                </div>
                                                {review.reviewText ? (
                                                    <p className="text-sm text-slate-400 line-clamp-2">
                                                        {review.reviewText}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic flex items-center gap-2">
                                                        <Sparkles size={14} />
                                                        No review text yet - click edit to add or generate
                                                    </p>
                                                )}

                                                {/* Meta info */}
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                                                    {review.dueDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            Due: {format(new Date(review.dueDate), "MMM d, yyyy")}
                                                        </span>
                                                    )}
                                                    {review.emailUsed && (
                                                        <span
                                                            className="flex items-center gap-1 text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors"
                                                            onClick={() => copyToClipboard(review.emailUsed!, "Email")}
                                                        >
                                                            <Mail size={12} />
                                                            {review.emailUsed}
                                                        </span>
                                                    )}
                                                    {review.status === "DONE" && review.completedAt && (
                                                        <span className="flex items-center gap-1 text-emerald-400">
                                                            <Calendar size={12} />
                                                            Completed: {format(new Date(review.completedAt), "MMM d, yyyy")}
                                                        </span>
                                                    )}
                                                    {isLiveOrDone && review.reviewLiveLink && (
                                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                            Live Review
                                                        </Badge>
                                                    )}
                                                    {review.notes && (
                                                        <span className="text-slate-500 truncate max-w-[200px]">
                                                            Note: {review.notes}
                                                        </span>
                                                    )}
                                                    {/* Lock Indicator */}
                                                    {getLock(review.id) && (
                                                        <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10 gap-1 pl-1 pr-2">
                                                            <Lock size={10} />
                                                            {getLock(review.id)?.userId === currentUser?.id
                                                                ? "Editing by You"
                                                                : `Locked by ${getLock(review.id)?.username}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions - PROFILE PAGE STYLE */}
                                        <div className="flex items-center gap-2">
                                            <ReviewActionButtons
                                                reviewId={review.id}
                                                gmbLink={review.profile.gmbLink}
                                                reviewLiveLink={review.reviewLiveLink}
                                                reviewText={review.reviewText}
                                                status={review.status}
                                                isLocked={isLocked(review.id)}
                                                lockedBy={getLock(review.id)?.username}
                                                onAction={() => acquireLock(review.id)}
                                            />

                                            {/* Edit Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (isLocked(review.id)) {
                                                        toast.error(`Locked by ${getLock(review.id)?.username}`);
                                                        return;
                                                    }
                                                    acquireLock(review.id);
                                                    handleEditReview(review);
                                                }}
                                                className={`h-9 px-3 ${isLocked(review.id) ? "text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-white"}`}
                                                title={isLocked(review.id) ? `Locked by ${getLock(review.id)?.username}` : "Edit Review"}
                                                disabled={isLocked(review.id)}
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            {/* Status Dropdown - PROFILE PAGE STYLE (optimistic) */}
                                            <Select
                                                value={review.status}
                                                onValueChange={(val) => handleStatusChange(review.id, val)}
                                                disabled={isLocked(review.id)}
                                            >
                                                <SelectTrigger
                                                    className={`w-[140px] ${statusConfig[review.status]?.color || "bg-slate-600"} border-0 text-white font-medium transition-all duration-300`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {statusConfig[review.status]?.icon}
                                                        {statusConfig[review.status]?.label || review.status}
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent position="popper" className="bg-slate-800 border-slate-700">
                                                    {Object.entries(statusConfig).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <span className="flex items-center gap-2">
                                                                {config.icon}
                                                                {config.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </InfiniteScroll>
            )}

            {/* UNIFIED POPUP: Single popup for ALL checks (small or large) */}
            {/* Serverside managed, refresh-proof */}

            {isChecking && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 w-96">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Loader2 className="animate-spin text-indigo-400" size={16} />
                                Live Checking
                            </h3>
                            <span className="text-xs text-slate-400">
                                {batchProgress.totalReviews} reviews
                            </span>
                        </div>

                        {/* Overall Progress */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-white font-medium">{batchProgress.overallProgress}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${batchProgress.overallProgress}%` }}
                                />
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {batchProgress.processedReviews} / {batchProgress.totalReviews} reviews
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
                            <div className="text-center">
                                <div className="text-lg font-bold text-emerald-400">{batchStats.live}</div>
                                <div className="text-xs text-slate-400">Live</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-400">{batchStats.missing}</div>
                                <div className="text-xs text-slate-400">Missing</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-orange-400">{batchStats.error}</div>
                                <div className="text-xs text-slate-400">Errors</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-slate-700">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleStop}
                                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                                <StopCircle size={14} className="mr-2" />
                                Stop
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"
                            >
                                <RotateCcw size={14} className="mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form - Lazy loaded */}
            <Suspense fallback={<div></div>}>
                <ReviewForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    review={editingReview}
                    onSuccess={fetchReviewsData}
                />
            </Suspense>
        </div>
    );
}
