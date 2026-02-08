"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Store,
    Plus,
    Search,
    Loader2,
    Star,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Archive,
    ArchiveRestore,
    CheckSquare,
    Square,
    Upload,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProfileCard } from "@/components/profiles/profile-card";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
    client?: {
        id: string;
        name: string;
    };
    reviewCount?: number;
    reviewOrdered?: number;
    liveCount?: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Client {
    id: string;
    name: string;
}

export default function ProfilesPage() {
    const { can, isAdmin } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === profiles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(profiles.map(p => p.id)));
        }
    };

    const handleBulkAction = async (action: "archive" | "delete" | "restore") => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.size} profiles?`)) return;

        try {
            const res = await fetch("/api/profiles/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    action,
                }),
            });

            if (res.ok) {
                toast.success(`Profiles ${action}d successfully`);
                setSelectedIds(new Set());
                fetchProfiles();
            } else {
                toast.error("Failed to perform action");
            }
        } catch {
            toast.error("Error performing action");
        }
    };
    const [categories, setCategories] = useState<Category[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    // New profile dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProfile, setNewProfile] = useState({
        businessName: "",
        gmbLink: "",
        category: "",
        clientId: "",
        reviewLimit: "",
        reviewsStartDate: new Date().toISOString().split("T")[0],
        reviewOrdered: "",
        autoCreateReviews: false,
    });

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                fullData: "true",
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.set("search", search);
            if (categoryFilter !== "all") params.set("category", categoryFilter);

            const res = await fetch(`/api/profiles?${params}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            setProfiles(data.profiles || data);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || data.length || 0);
        } catch {
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryFilter]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?activeOnly=true");
            if (res.ok) {
                const cats = await res.json();
                setCategories(cats);
            }
        } catch {
            console.error("Failed to load categories");
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/clients?limit=100");
            if (res.ok) {
                const result = await res.json();
                // API returns { data: [...], meta: {...} }
                setClients(Array.isArray(result.data) ? result.data : []);
            }
        } catch {
            console.error("Failed to load clients");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchClients();
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    useEffect(() => {
        setPage(1);
    }, [search, categoryFilter]);

    const handleCreateProfile = async () => {
        if (!newProfile.businessName.trim()) {
            toast.error("Business name is required");
            return;
        }
        if (!newProfile.clientId) {
            toast.error("Client is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProfile),
            });

            if (res.ok) {
                toast.success("Profile created successfully");
                setIsDialogOpen(false);
                setNewProfile({
                    businessName: "",
                    gmbLink: "",
                    category: "",
                    clientId: "",
                    reviewLimit: "",
                    reviewsStartDate: new Date().toISOString().split("T")[0],
                    reviewOrdered: "",
                    autoCreateReviews: false,
                });
                fetchProfiles();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create profile");
            }
        } catch {
            toast.error("Failed to create profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchiveProfile = async (profile: Profile) => {
        if (!confirm(`Are you sure you want to archive "${profile.businessName}"?`)) return;
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Profile archived");
                fetchProfiles();
            } else {
                toast.error("Failed to archive profile");
            }
        } catch {
            toast.error("Error archiving profile");
        }
    };

    const handleRestoreProfile = async (profile: Profile) => {
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: false }),
            });
            if (res.ok) {
                toast.success("Profile restored");
                fetchProfiles();
            } else {
                toast.error("Failed to restore profile");
            }
        } catch {
            toast.error("Error restoring profile");
        }
    };

    const handleDeleteProfile = async (profile: Profile) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete "${profile.businessName}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/profiles/${profile.id}?permanent=true`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Profile deleted permanently");
                fetchProfiles();
            } else {
                toast.error("Failed to delete profile");
            }
        } catch {
            toast.error("Error deleting profile");
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Store className="text-indigo-400" />
                        GMB Profiles
                    </h1>
                    <p className="text-slate-400">
                        Manage your Google My Business profiles
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isAdmin && (
                    <Link href="/profiles/import">
                        <Button
                            variant="outline"
                            className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/10"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                    </Link>
                )}
                {isAdmin && (
                    <Button
                        variant={isSelectionMode ? "secondary" : "outline"}
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedIds(new Set());
                        }}
                        className="border-slate-600 text-slate-300"
                    >
                        {isSelectionMode ? "Cancel Selection" : "Select Profiles"}
                    </Button>
                )}
                {can.addProfiles && (
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Profile
                    </Button>
                )}
            </div>


            {/* Bulk Action Bar - Sticky if selection active */}
            {
                isSelectionMode && selectedIds.size > 0 && isAdmin && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in">
                        <span className="text-white font-medium">
                            {selectedIds.size} selected
                        </span>
                        <div className="h-6 w-px bg-slate-700" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBulkAction("archive")}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBulkAction("delete")}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                        <div className="h-6 w-px bg-slate-700" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds(new Set())}
                            className="text-slate-400 hover:text-white"
                        >
                            Clear
                        </Button>
                    </div>
                )
            }

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Profiles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-400">
                            {new Set(profiles.map((p) => p.category).filter(Boolean)).size}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {profiles.reduce((sum, p) => sum + (p.reviewCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4">
                {/* Admin Selection Toolbar */}
                {isAdmin && isSelectionMode && (
                    <div className="flex items-center gap-2 p-2 bg-slate-800/30 rounded border border-slate-700/50 w-full sm:w-auto self-start">
                        <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-indigo-400 hover:bg-slate-700">
                            {selectedIds.size === profiles.length && profiles.length > 0 ? "Deselect All" : "Select All"}
                        </Button>
                        <span className="text-slate-400 text-sm">{selectedIds.size} of {profiles.length} selected</span>
                    </div>
                )}
                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by business name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </div>

            {/* Loading */}
            {
                loading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : profiles.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Store className="h-12 w-12 text-slate-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-white">
                                No profiles found
                            </h3>
                            <p className="text-slate-400 mb-4">
                                Get started by adding your first GMB profile
                            </p>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Profile
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Profiles Grid - Unified ProfileCard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profiles.map((profile) => (
                                <ProfileCard
                                    key={profile.id}
                                    profile={profile}
                                    isSelected={selectedIds.has(profile.id)}
                                    onToggleSelect={() => toggleSelection(profile.id)}
                                    showClientName={true}
                                    onArchive={can.deleteProfiles ? handleArchiveProfile : undefined}
                                    onRestore={can.deleteProfiles ? handleRestoreProfile : undefined}
                                    onDelete={can.deleteProfiles ? handleDeleteProfile : undefined}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {
                            totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">
                                        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of{" "}
                                        {total}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-slate-300">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        }
                    </>
                )
            }

            {/* Create Profile Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Store className="text-indigo-400" size={20} />
                            Add New Profile
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="text-slate-300">
                                Business Name *
                            </Label>
                            <Input
                                id="businessName"
                                value={newProfile.businessName}
                                onChange={(e) =>
                                    setNewProfile({ ...newProfile, businessName: e.target.value })
                                }
                                placeholder="Enter business name"
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gmbLink" className="text-slate-300">
                                GMB Link
                            </Label>
                            <Input
                                id="gmbLink"
                                value={newProfile.gmbLink}
                                onChange={(e) =>
                                    setNewProfile({ ...newProfile, gmbLink: e.target.value })
                                }
                                placeholder="https://g.page/..."
                                className="bg-slate-900 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientId" className="text-slate-300">
                                Client <span className="text-red-400">*</span>
                            </Label>
                            <Select
                                value={newProfile.clientId}
                                onValueChange={(val) =>
                                    setNewProfile({ ...newProfile, clientId: val })
                                }
                            >
                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {clients?.length === 0 && (
                                        <SelectItem value="__no_clients__" disabled>
                                            No clients available
                                        </SelectItem>
                                    )}
                                    {clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-slate-300">
                                Category
                            </Label>
                            <Select
                                value={newProfile.category}
                                onValueChange={(val) =>
                                    setNewProfile({ ...newProfile, category: val })
                                }
                            >
                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.slug}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reviewOrdered" className="text-slate-300">
                                    Reviews Ordered
                                </Label>
                                <Input
                                    id="reviewOrdered"
                                    type="number"
                                    min="0"
                                    value={newProfile.reviewOrdered}
                                    onChange={(e) =>
                                        setNewProfile({ ...newProfile, reviewOrdered: e.target.value })
                                    }
                                    placeholder="e.g. 10"
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reviewLimit" className="text-slate-300">
                                    Daily Limit
                                </Label>
                                <Input
                                    id="reviewLimit"
                                    type="number"
                                    min="1"
                                    value={newProfile.reviewLimit}
                                    onChange={(e) =>
                                        setNewProfile({ ...newProfile, reviewLimit: e.target.value })
                                    }
                                    placeholder="e.g. 5"
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reviewsStartDate" className="text-slate-300">
                                    Start Date
                                </Label>
                                <Input
                                    id="reviewsStartDate"
                                    type="date"
                                    value={newProfile.reviewsStartDate}
                                    onChange={(e) =>
                                        setNewProfile({ ...newProfile, reviewsStartDate: e.target.value })
                                    }
                                    className="bg-slate-900 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                        {/* Auto-create checkbox - only show when reviewOrdered has a value */}
                        {newProfile.reviewOrdered && parseInt(newProfile.reviewOrdered) > 0 && (
                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="autoCreateReviews"
                                    checked={newProfile.autoCreateReviews}
                                    onChange={(e) =>
                                        setNewProfile({ ...newProfile, autoCreateReviews: e.target.checked })
                                    }
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor="autoCreateReviews" className="text-slate-300 text-sm cursor-pointer">
                                    Auto-create {newProfile.reviewOrdered} pending reviews
                                </Label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="border-slate-600 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProfile}
                            disabled={isSubmitting || !newProfile.businessName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Profile"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
