"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Star,
    Plus,
    ExternalLink,
    Store,
    Clock,
    Pencil,
    Mail,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Copy,
    Calendar,
    Filter,
    Search,
    Archive,
    Trash2,
    RotateCcw,
    Loader2,
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
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewGeneratorModal } from "@/components/reviews/review-generator-modal";
import { CopyButton } from "@/components/ui/copy-button";
import { ExportButton } from "@/components/reviews/export-button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchReviews,
    updateReviewStatus,
    optimisticStatusUpdate,
    revertStatusUpdate,
    optimisticUpdateReview,
    optimisticDeleteReview,
    revertDeleteReview,
    optimisticArchiveReview,
    type Review,
} from "@/lib/features/reviewsSlice";
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
    onAction: () => void;
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
    const showReviewActions = (status === "LIVE" || status === "DONE" || status === "APPLIED") && reviewLiveLink;

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
                        onClick={() => handleAction(() => copyToClipboard(reviewLiveLink!, "Review Link"))}
                        className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        title="Copy Review Link"
                    >
                        <Copy size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(() => window.open(reviewLiveLink!, "_blank"))}
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


export default function ReviewsPage() {
    const { can } = useAuth();
    const dispatch = useAppDispatch();
    const { items: allReviews, meta, loading } = useAppSelector((state) => state.reviews);

    const { data: session } = useSession();

    const [displayedCount, setDisplayedCount] = useState(20); // Infinite scroll: 20 items at a time
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [clientFilter, setClientFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [profileFilter, setProfileFilter] = useState("all");
    const [dueDateFilter, setDueDateFilter] = useState("today"); // "all" | "today"
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Filter options
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [profiles, setProfiles] = useState<Array<{ id: string; businessName: string }>>([]);

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);

    // Lock Management
    const { isLocked, getLock, acquireLock, releaseLock, currentUser } = useReviewLocks();

    // Worker stats for progress bar
    const [myStats, setMyStats] = useState<{
        today: { updated: number; live: number };
        teamToday: { total: number; live: number; pending: number };
        totalCreated: number;
        totalUpdated: number;
    } | null>(null);

    // Client-side filtering
    const filteredReviews = allReviews.filter(r => {
        // Status Filter
        if (statusFilter !== "all" && r.status !== statusFilter) return false;

        // Client Filter
        if (clientFilter !== "all") {
            // Use type assertion or optional chaining if property exists on runtime object
            const p = r.profile as any;
            if (p?.clientId !== clientFilter) return false;
        }

        // Category Filter
        if (categoryFilter !== "all" && r.profile?.category !== categoryFilter) return false;

        // Profile Filter
        if (profileFilter !== "all" && r.profile?.id !== profileFilter) return false;

        // Due Date Filter (Today)
        if (dueDateFilter === "today") {
            const today = new Date().toISOString().split('T')[0];
            const due = r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : null;
            // logic: if filter is today, show Overdue OR Due Today
            if (!due || due > today) return false;
        }

        // Search (Basic client-side fallback)
        if (search) {
            const lowerSearch = search.toLowerCase();
            const textMatch = r.reviewText?.toLowerCase().includes(lowerSearch);
            const businessMatch = r.profile?.businessName?.toLowerCase().includes(lowerSearch);
            const notesMatch = r.notes?.toLowerCase().includes(lowerSearch);
            if (!textMatch && !businessMatch && !notesMatch) return false;
        }

        return true;
    });

    // Infinite scroll: display only first N items
    const reviews = filteredReviews.slice(0, displayedCount);

    // Check if more items available
    const hasMore = displayedCount < filteredReviews.length;

    // Load more function - 20 items at a time
    const loadMore = useCallback(() => {
        setDisplayedCount(prev => Math.min(prev + 20, filteredReviews.length));
    }, [filteredReviews.length]);

    const isLoading = loading === "pending";

    // Fetch filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                if (session?.user?.role === "ADMIN") {
                    const [clientsRes, categoriesRes, profilesRes] = await Promise.all([
                        fetch("/api/filters/options?type=clients"),
                        fetch("/api/filters/options?type=categories"),
                        fetch("/api/filters/options?type=profiles"),
                    ]);
                    const [clientsData, categoriesData, profilesData] = await Promise.all([
                        clientsRes.json(),
                        categoriesRes.json(),
                        profilesRes.json(),
                    ]);
                    setClients(clientsData);
                    setCategories(categoriesData);
                    setProfiles(profilesData);
                } else {
                    // For clients, only fetch categories and profiles
                    const [categoriesRes, profilesRes] = await Promise.all([
                        fetch("/api/filters/options?type=categories"),
                        fetch("/api/filters/options?type=profiles"),
                    ]);
                    const [categoriesData, profilesData] = await Promise.all([
                        categoriesRes.json(),
                        profilesRes.json(),
                    ]);
                    setCategories(categoriesData);
                    setProfiles(profilesData);
                }

                // Fetch my performance stats
                const statsRes = await fetch("/api/me/stats");
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setMyStats(statsData);
                }
            } catch (error) {
                console.error("Error fetching filter options:", error);
            }
        };
        if (session?.user) {
            fetchFilterOptions();
        }
    }, [session]);

    // Fetch reviews
    const fetchReviewsData = useCallback(async () => {
        const params: {
            limit: number;
            clientId?: string;
            category?: string;
            profileId?: string;
            status?: string;
            search?: string;
            profile?: {
                id: string;
                businessName: string;
                gmbLink: string | null;
                category?: string | null;
                reviewOrdered?: number;
                client?: {
                    name: string;
                };
                _count?: {
                    reviews: number;
                };
            };
            isArchived?: boolean;
            dueDate?: string;
        } = { limit: 5000 }; // Fetch all, filter client-side

        if (clientFilter !== "all") params.clientId = clientFilter;
        if (categoryFilter !== "all") params.category = categoryFilter;
        if (profileFilter !== "all") params.profileId = profileFilter;
        if (statusFilter !== "all") params.status = statusFilter;
        if (search) params.search = search;
        if (showArchived) params.isArchived = true;

        // Add due date filter
        if (dueDateFilter === "today") {
            params.dueDate = new Date().toISOString().split('T')[0]; // simple YYYY-MM-DD for today
        }

        await dispatch(fetchReviews(params));
    }, [dispatch, clientFilter, categoryFilter, profileFilter, statusFilter, search, showArchived, dueDateFilter]);

    // Reset displayed count when filters change
    useEffect(() => {
        setDisplayedCount(20);
        setSelectedIds([]);
    }, [clientFilter, categoryFilter, profileFilter, statusFilter, search, showArchived, dueDateFilter]);

    useEffect(() => {
        fetchReviewsData();
    }, [fetchReviewsData]);

    // Optimistic status change with filter-aware removal
    // When status changes and new status doesn't match current filter, item smoothly disappears
    const handleStatusChange = async (reviewId: string, newStatus: string) => {
        const review = reviews.find((r) => r.id === reviewId);
        if (!review) return;

        const oldStatus = review.status;

        // Check if new status will still match the current filter
        const willMatchFilter = statusFilter === "all" || newStatus === statusFilter;

        // Optimistic update - smooth, no blink
        dispatch(optimisticStatusUpdate({ reviewId, status: newStatus }));

        // Optimistic progress bar update
        setMyStats((prev) => {
            if (!prev) return prev;

            // Track PENDING → LIVE conversion
            const wasPending = oldStatus === "PENDING";
            const isNowLive = newStatus === "LIVE";

            return {
                ...prev,
                today: {
                    updated: prev.today.updated + 1,
                    live: newStatus === "LIVE" ? prev.today.live + 1 : prev.today.live,
                },
                teamToday: {
                    ...prev.teamToday,
                    live: isNowLive ? prev.teamToday.live + 1 : prev.teamToday.live,
                    pending: wasPending && isNowLive ? prev.teamToday.pending - 1 : prev.teamToday.pending,
                },
                totalUpdated: prev.totalUpdated + 1,
            };
        });

        // If new status doesn't match filter, smoothly remove from list
        if (!willMatchFilter) {
            // Small delay for smooth transition
            setTimeout(() => {
                dispatch(optimisticDeleteReview(reviewId));
            }, 300);
        }

        try {
            const result = await dispatch(updateReviewStatus({ reviewId, status: newStatus }));
            if (updateReviewStatus.fulfilled.match(result)) {
                toast.success(`Status updated to ${statusConfig[newStatus]?.label}`);
            } else {
                // Revert status
                dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
                // Revert progress bar
                setMyStats((prev) => {
                    if (!prev) return prev;

                    const wasPending = oldStatus === "PENDING";
                    const wasLive = newStatus === "LIVE";

                    return {
                        ...prev,
                        today: {
                            updated: prev.today.updated - 1,
                            live: wasLive ? prev.today.live - 1 : prev.today.live,
                        },
                        teamToday: {
                            ...prev.teamToday,
                            live: wasLive ? prev.teamToday.live - 1 : prev.teamToday.live,
                            pending: wasPending && wasLive ? prev.teamToday.pending + 1 : prev.teamToday.pending,
                        },
                        totalUpdated: prev.totalUpdated - 1,
                    };
                });
                // Revert removal if we removed it
                if (!willMatchFilter) {
                    dispatch(revertDeleteReview(review));
                }
                toast.error("Failed to update status");
            }
        } catch {
            dispatch(revertStatusUpdate({ reviewId, status: oldStatus }));
            // Revert progress bar
            setMyStats((prev) => {
                if (!prev) return prev;

                const wasPending = oldStatus === "PENDING";
                const wasLive = newStatus === "LIVE";

                return {
                    ...prev,
                    today: {
                        updated: prev.today.updated - 1,
                        live: wasLive ? prev.today.live - 1 : prev.today.live,
                    },
                    teamToday: {
                        ...prev.teamToday,
                        live: wasLive ? prev.teamToday.live - 1 : prev.teamToday.live,
                        pending: wasPending && wasLive ? prev.teamToday.pending + 1 : prev.teamToday.pending,
                    },
                    totalUpdated: prev.totalUpdated - 1,
                };
            });
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

    const selectAllOnPage = () => {
        const pageIds = reviews.map((r) => r.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    // Bulk archive (optimistic)
    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Archive ${selectedIds.length} review(s)?`)) return;

        // Save current items for potential rollback
        const itemsToArchive = reviews.filter(r => selectedIds.includes(r.id));

        // Optimistic: immediately remove from UI
        selectedIds.forEach(id => dispatch(optimisticArchiveReview(id)));
        setSelectedIds([]);
        toast.success(`${itemsToArchive.length} review(s) archived`);

        try {
            await Promise.all(
                itemsToArchive.map((review) =>
                    fetch(`/api/reviews/${review.id}`, { method: "DELETE" })
                )
            );
        } catch (error) {
            console.error("Bulk archive error:", error);
            toast.error("Archive failed - restoring items");
            // Rollback: add items back
            itemsToArchive.forEach(review => dispatch(revertDeleteReview(review)));
        }
    };

    // Bulk delete permanently (optimistic)
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`PERMANENTLY delete ${selectedIds.length} review(s)? This cannot be undone!`)) return;

        // Save current items for potential rollback
        const itemsToDelete = reviews.filter(r => selectedIds.includes(r.id));

        // Optimistic: immediately remove from UI
        selectedIds.forEach(id => dispatch(optimisticDeleteReview(id)));
        setSelectedIds([]);
        toast.success(`${itemsToDelete.length} review(s) permanently deleted`);

        try {
            await Promise.all(
                itemsToDelete.map((review) =>
                    fetch(`/api/reviews/${review.id}?permanent=true`, { method: "DELETE" })
                )
            );
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Delete failed - restoring items");
            // Rollback: add items back
            itemsToDelete.forEach(review => dispatch(revertDeleteReview(review)));
        }
    };

    // Bulk restore
    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/reviews/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isArchived: false }),
                    })
                )
            );
            toast.success("Reviews restored");
            setSelectedIds([]);
            fetchReviewsData();
        } catch (error) {
            console.error("Bulk restore error:", error);
            toast.error("Failed to restore");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleAddReview = () => {
        setEditingReview(null);
        setIsFormOpen(true);
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setIsFormOpen(true);
    };

    // Optimistic success handler - receives updated review data from form
    const handleReviewSuccess = (updatedReview?: Review) => {
        if (updatedReview && editingReview) {
            // Optimistic update - instantly update the UI
            dispatch(optimisticUpdateReview(updatedReview));
            toast.success("Review updated!");
        } else {
            // For new reviews, we need to refetch
            fetchReviewsData();
        }
        setIsFormOpen(false);
        setEditingReview(null);
    };

    const allPageSelected = reviews.length > 0 && reviews.every((r) => selectedIds.includes(r.id));

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Star className="text-yellow-400" size={28} />
                        Reviews
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage all your reviews across profiles
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                    <ExportButton />
                    {can.createReviews && (
                        <>
                            <Button
                                onClick={() => setIsGeneratorOpen(true)}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:text-white"
                            >
                                <Sparkles size={16} className="mr-2" />
                                Generate
                            </Button>
                            <Button
                                onClick={handleAddReview}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus size={16} className="mr-2" />
                                Add Review
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Worker Progress Bar - All Roles (Not just workers) */}
            {myStats && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">
                            Today&apos;s Progress
                        </span>
                        <span className="text-sm text-slate-400">
                            {myStats.teamToday?.live ?? 0} / {(myStats.teamToday?.pending ?? 0) + (myStats.teamToday?.live ?? 0)} LIVE today
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mb-3">
                        {/* Calculate: live / (pending + live) = % of initially pending that are now live */}
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-green-500 h-2.5 rounded-full transition-all duration-300"
                            style={{
                                width: `${(() => {
                                    const initialPending = (myStats.teamToday?.pending ?? 0) + (myStats.teamToday?.live ?? 0);
                                    if (initialPending === 0) return 0;
                                    return Math.min(100, ((myStats.teamToday?.live ?? 0) / initialPending) * 100);
                                })()}%`
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>📝 My Created: {myStats.totalCreated}</span>
                        <span>✏️ My Updated: {myStats.totalUpdated}</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <div className="relative col-span-2 sm:col-span-1 sm:flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900/50 border-slate-800"
                    />
                </div>

                {/* Admin-only: Filter by Client */}
                {session?.user?.role === "ADMIN" && clients.length > 0 && (
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
                            <Filter size={14} className="mr-2" />
                            <SelectValue placeholder="Client" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Clients</SelectItem>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Filter by Category */}
                {categories.length > 0 && (
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-white">
                            <Filter size={14} className="mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Filter by Profile */}
                {profiles.length > 0 && (
                    <Select value={profileFilter} onValueChange={setProfileFilter}>
                        <SelectTrigger className="w-[200px] bg-slate-800/50 border-slate-700 text-white">
                            <Filter size={14} className="mr-2" />
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
                )}

                <div className="flex items-center space-x-2">
                    <Button
                        variant={dueDateFilter === "today" ? "default" : "outline"}
                        onClick={() => setDueDateFilter(prev => prev === "today" ? "all" : "today")}
                        className={`h-10 ${dueDateFilter === "today" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"}`}
                    >
                        <Calendar size={14} className="mr-2" />
                        Due Today
                    </Button>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700 text-white">
                        <Filter size={14} className="mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="MISSING">Missing</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="GOOGLE_ISSUE">Google Issue</SelectItem>
                        <SelectItem value="LIVE">Live</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                </Select>
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
                                onClick={handleBulkRestore}
                                className="border-slate-600 text-slate-300"
                                disabled={isBulkProcessing}
                            >
                                {isBulkProcessing ? (
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <RotateCcw size={14} className="mr-2" />
                                )}
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

            {/* Reviews List - Profile Style with Checkbox */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3" />
                    Loading reviews...
                </div>
            ) : reviews.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Star className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">No reviews found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            {statusFilter !== "all"
                                ? "Try changing the filter"
                                : showArchived
                                    ? "No archived reviews"
                                    : "Add your first review to get started"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <InfiniteScroll
                    dataLength={reviews.length}
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
                            ✓ All {filteredReviews.length} reviews loaded
                        </div>
                    }
                    className="space-y-3"
                >
                    {reviews.map((review) => {
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
                                                    {/* Profile Progress: reviewOrdered / (reviewOrdered - total LIVE reviews) */}
                                                    {review.profile.reviewOrdered && review.profile.reviewOrdered > 0 && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                                                                    style={{
                                                                        width: `${Math.min(100, ((review.profile._count?.reviews || 0) / review.profile.reviewOrdered) * 100)}%`
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-slate-400 whitespace-nowrap">
                                                                {review.profile._count?.reviews || 0}/{review.profile.reviewOrdered}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Attribution - show liveBy for LIVE, updatedBy for others */}
                                                    {review.status === "LIVE" && (review.liveBy?.name || review.updatedBy?.name) ? (
                                                        <span className="text-green-400 text-xs">
                                                            Live by {review.liveBy?.name || review.updatedBy?.name}
                                                        </span>
                                                    ) : review.status === "APPLIED" && review.updatedBy?.name ? (
                                                        <span className="text-purple-400 text-xs">
                                                            Applied by {review.updatedBy.name}
                                                        </span>
                                                    ) : review.updatedBy?.name ? (
                                                        <span className="text-slate-500 text-xs">
                                                            Updated by {review.updatedBy.name}
                                                        </span>
                                                    ) : review.createdBy?.name && (
                                                        <span className="text-slate-500 text-xs">
                                                            Created by {review.createdBy.name}
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
                                                            title="Click to copy email"
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
                                                    {review.isScheduled && (
                                                        <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs flex items-center gap-1">
                                                            <Clock size={10} />
                                                            Scheduled
                                                            {review.scheduledFor && ` for ${format(new Date(review.scheduledFor), "MMM d")}`}
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

                                        {/* Actions */}
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

                                            {/* Edit Button - Gated */}
                                            {can.editReviews && (
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
                                            )}

                                            {/* Status Dropdown - Gated */}
                                            <Select
                                                value={review.status}
                                                onValueChange={(val) => handleStatusChange(review.id, val)}
                                                disabled={!can.editReviews || isLocked(review.id)}
                                            >
                                                <SelectTrigger
                                                    className={`w-[140px] ${statusConfig[review.status]?.color || "bg-slate-600"} border-0 text-white font-medium transition-all duration-300 ${!can.editReviews ? "opacity-70 cursor-not-allowed" : ""}`}
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

            {/* Review Form (Add/Edit) */}
            <ReviewForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                review={editingReview}
                onSuccess={handleReviewSuccess}
            />

            {/* Generator Modal */}
            <ReviewGeneratorModal
                open={isGeneratorOpen}
                onOpenChange={setIsGeneratorOpen}
            />
        </div>
    );
}
