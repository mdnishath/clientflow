"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
import { PaginationControls } from "@/components/ui/pagination-controls";
import { LiveCheckProgress } from "@/components/reviews/live-check-progress";
import { CheckStatusBadge } from "@/components/reviews/check-status-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ExportButton } from "@/components/reviews/export-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { useLiveCheck } from "@/hooks/use-live-check";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchReviews,
    updateReviewStatus,
    optimisticStatusUpdate,
    revertStatusUpdate,
    type Review,
} from "@/lib/features/reviewsSlice";
import { toast } from "sonner";

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

function ReviewActionButtons({
    gmbLink,
    reviewLiveLink,
    reviewText,
    status,
}: {
    gmbLink: string | null;
    reviewLiveLink: string | null;
    reviewText: string | null;
    status: string;
}) {
    const showReviewActions = (status === "LIVE" || status === "DONE" || status === "APPLIED") && reviewLiveLink;

    return (
        <div className="flex items-center gap-1">
            {reviewText && (
                <CopyButton
                    text={reviewText}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                    variant="ghost"
                    size="sm"
                />
            )}
            {gmbLink && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(gmbLink, "GMB Link")}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Copy GMB Link"
                    >
                        <Store size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(gmbLink, "_blank")}
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
    const { items: reviews, meta, loading } = useAppSelector((state) => state.reviews);

    const [page, setPage] = useState(1);
    const [loadMode, setLoadMode] = useState<"paginated" | "all">("paginated");
    const [statusFilter, setStatusFilter] = useState("not-PENDING");
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    const isLoading = loading === "pending";

    // Live Check Hook
    const {
        stats,
        status: checkStatus,
        isOpen: isProgressOpen,
        setIsOpen: setProgressOpen,
        startChecks,
        stopChecks
    } = useLiveCheck();

    const isChecking = checkStatus === "STARTING" || checkStatus === "RUNNING";

    // Fetch reviews
    const fetchReviewsData = useCallback(async () => {
        const params: {
            page: number;
            limit: number;
            status?: string;
            search?: string;
            isArchived?: boolean;
        } = {
            page: loadMode === "all" ? 1 : page,
            limit: loadMode === "all" ? 1000 : 20
        };

        if (statusFilter !== "all") params.status = statusFilter;
        if (search) params.search = search;
        if (showArchived) params.isArchived = true;

        await dispatch(fetchReviews(params));
    }, [dispatch, page, loadMode, statusFilter, search, showArchived]);

    useEffect(() => {
        setPage(1);
        setSelectedIds([]);
    }, [statusFilter, search, showArchived]);

    useEffect(() => {
        fetchReviewsData();
    }, [fetchReviewsData]);

    // Optimistic status change (like profile page)
    const handleStatusChange = async (reviewId: string, newStatus: string) => {
        const review = reviews.find((r) => r.id === reviewId);
        if (!review) return;

        const oldStatus = review.status;

        // Optimistic update - smooth, no blink
        dispatch(optimisticStatusUpdate({ reviewId, status: newStatus }));

        try {
            const result = await dispatch(updateReviewStatus({ reviewId, status: newStatus }));
            if (updateReviewStatus.fulfilled.match(result)) {
                toast.success(`Status updated to ${statusConfig[newStatus]?.label}`);
            } else {
                dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
                toast.error("Failed to update status");
            }
        } catch {
            dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
            toast.error("Failed to update status");
        }
    };

    // Selection functions
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const selectAllOnPage = () => {
        const pageIds = reviews.map((r) => r.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
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

    // Live Check functions
    const handleCheckSelected = () => {
        if (selectedIds.length === 0) {
            toast.warning("Select reviews first");
            return;
        }
        startChecks(selectedIds);
        toast.success(`Checking ${selectedIds.length} reviews...`);
    };

    const handleCheckAll = () => {
        const allIds = reviews.map((r) => r.id);
        setSelectedIds(allIds);
        startChecks(allIds);
        toast.success(`Checking ${allIds.length} reviews...`);
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    const allPageSelected = reviews.length > 0 && reviews.every((r) => selectedIds.includes(r.id));

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
                <div className="flex items-center gap-2">
                    <ExportButton />
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
                        disabled={isChecking || reviews.length === 0}
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
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-slate-700 text-white"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white">
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
                <Button
                    variant={loadMode === "all" ? "default" : "outline"}
                    onClick={() => {
                        setLoadMode(loadMode === "paginated" ? "all" : "paginated");
                        setPage(1);
                    }}
                    className={loadMode === "all" ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-700 text-slate-300"}
                >
                    {loadMode === "all" ? "Showing All" : "Load All"}
                </Button>
                <Button
                    variant={showArchived ? "default" : "outline"}
                    onClick={() => setShowArchived(!showArchived)}
                    className={showArchived ? "bg-amber-600 hover:bg-amber-700" : "border-slate-700 text-slate-300"}
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

            {/* Select All Header */}
            <div className="flex items-center gap-3 mb-3 px-1">
                <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={selectAllOnPage}
                    className="border-slate-500"
                />
                <span className="text-sm text-slate-400">
                    {allPageSelected ? "Deselect all on page" : "Select all on page"}
                </span>
                {meta && (
                    <span className="text-sm text-slate-500 ml-auto">
                        {meta.total} total reviews
                    </span>
                )}
            </div>

            {/* Reviews List - PROFILE PAGE STYLE */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3" />
                    Loading reviews...
                </div>
            ) : reviews.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Activity className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">No reviews found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => {
                        const isSelected = selectedIds.includes(review.id);
                        const isLiveOrDone = review.status === "LIVE" || review.status === "DONE";

                        return (
                            <Card
                                key={review.id}
                                className={`border-slate-700 hover:bg-slate-800/70 transition-colors ${isSelected ? "ring-2 ring-indigo-500 bg-indigo-600/10" : "bg-slate-800/50"
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
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions - PROFILE PAGE STYLE */}
                                        <div className="flex items-center gap-2">
                                            <ReviewActionButtons
                                                gmbLink={review.profile.gmbLink}
                                                reviewLiveLink={review.reviewLiveLink}
                                                reviewText={review.reviewText}
                                                status={review.status}
                                            />

                                            {/* Edit Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditReview(review)}
                                                className="text-slate-400 hover:text-white h-9 px-3"
                                                title="Edit Review"
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            {/* Status Dropdown - PROFILE PAGE STYLE (optimistic) */}
                                            <Select
                                                value={review.status}
                                                onValueChange={(val) => handleStatusChange(review.id, val)}
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
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && loadMode === "paginated" && (
                <div className="mt-6">
                    <PaginationControls
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Live Check Progress Panel */}
            <LiveCheckProgress
                stats={stats}
                status={checkStatus}
                isOpen={isProgressOpen}
                onToggle={setProgressOpen}
                onStop={stopChecks}
            />

            {/* Review Form */}
            <ReviewForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                review={editingReview}
                onSuccess={fetchReviewsData}
            />
        </div>
    );
}
