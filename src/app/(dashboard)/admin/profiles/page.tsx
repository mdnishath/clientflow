"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Trash2, Loader2, MoreHorizontal, Archive,
    RotateCcw, Search, Building2, ChevronLeft, ChevronRight,
    ExternalLink, Download
} from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/reviews/export-button";

interface Profile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
    createdAt: string;
    client: {
        id: string;
        name: string;
    };
    reviewCount: number;
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

export default function ProfilesAdminPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [clientFilter, setClientFilter] = useState("all");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    // Multi-select
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
    const [permanentDelete, setPermanentDelete] = useState(false);

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                fullData: "true",
                page: page.toString(),
                limit: limit.toString(),
            });

            if (showArchived) {
                params.set("archivedOnly", "true");
            }
            if (search) {
                params.set("search", search);
            }
            if (categoryFilter !== "all") {
                params.set("category", categoryFilter);
            }
            if (clientFilter !== "all") {
                params.set("clientId", clientFilter);
            }

            const res = await fetch(`/api/profiles?${params}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            setProfiles(data.profiles);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch {
            toast.error("Failed to load profiles");
        } finally {
            setLoading(false);
        }
    }, [page, showArchived, search, categoryFilter, clientFilter]);

    const fetchFilters = async () => {
        try {
            const [catRes, clientRes] = await Promise.all([
                fetch("/api/categories?activeOnly=true"),
                fetch("/api/clients?limit=100"),
            ]);

            if (catRes.ok) {
                const cats = await catRes.json();
                setCategories(cats);
            }
            if (clientRes.ok) {
                const data = await clientRes.json();
                setClients(data.data || []);
            }
        } catch {
            console.error("Failed to load filters");
        }
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
        setSelectedIds(new Set());
    }, [showArchived, search, categoryFilter, clientFilter]);

    // Handlers
    const handleArchive = async (profile: Profile) => {
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to archive");
            toast.success(`"${profile.businessName}" archived`);
            fetchProfiles();
        } catch {
            toast.error("Failed to archive profile");
        }
    };

    const handleRestore = async (profile: Profile) => {
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: false }),
            });
            if (!res.ok) throw new Error("Failed to restore");
            toast.success(`"${profile.businessName}" restored`);
            fetchProfiles();
        } catch {
            toast.error("Failed to restore profile");
        }
    };

    const handleDelete = async () => {
        if (!deletingProfile) return;

        try {
            const url = permanentDelete
                ? `/api/profiles/${deletingProfile.id}?permanent=true`
                : `/api/profiles/${deletingProfile.id}`;

            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            toast.success(permanentDelete
                ? `"${deletingProfile.businessName}" permanently deleted`
                : `"${deletingProfile.businessName}" archived`
            );
            setDeleteDialogOpen(false);
            setDeletingProfile(null);
            setPermanentDelete(false);
            fetchProfiles();
        } catch {
            toast.error("Failed to delete profile");
        }
    };

    // Multi-select handlers
    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === profiles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(profiles.map(p => p.id)));
        }
    };

    const handleBulkArchive = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const res = await fetch("/api/profiles/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });

            if (!res.ok) throw new Error("Failed to archive");
            toast.success(`${selectedIds.size} profiles archived`);
            setSelectedIds(new Set());
            fetchProfiles();
        } catch {
            toast.error("Failed to archive profiles");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const res = await fetch("/api/profiles/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds), action: "restore" }),
            });

            if (!res.ok) throw new Error("Failed to restore");
            toast.success(`${selectedIds.size} profiles restored`);
            setSelectedIds(new Set());
            fetchProfiles();
        } catch {
            toast.error("Failed to restore profiles");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const res = await fetch("/api/profiles/bulk", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });

            if (!res.ok) throw new Error("Failed to delete");
            toast.success(`${selectedIds.size} profiles permanently deleted`);
            setSelectedIds(new Set());
            setBulkDeleteDialogOpen(false);
            fetchProfiles();
        } catch {
            toast.error("Failed to delete profiles");
        } finally {
            setBulkActionLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">GMB Profiles</h1>
                    <p className="text-slate-400">
                        Manage all Google My Business profiles across clients
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton />
                    <div className="flex items-center gap-2">
                        <Switch
                            id="show-archived"
                            checked={showArchived}
                            onCheckedChange={setShowArchived}
                        />
                        <Label htmlFor="show-archived" className="text-sm text-slate-300">
                            {showArchived ? "Showing Archived" : "Showing Active"}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            {showArchived ? "Archived Profiles" : "Active Profiles"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Selected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-400">{selectedIds.size}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Page
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-300">{page} / {totalPages || 1}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
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
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="All Clients" />
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
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-300">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex-1" />
                    {showArchived ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkRestore}
                            disabled={bulkActionLoading}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                            Restore Selected
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkArchive}
                            disabled={bulkActionLoading}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            {bulkActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                            Archive Selected
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                        disabled={bulkActionLoading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Permanently
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds(new Set())}
                        className="text-slate-400 hover:text-white"
                    >
                        Clear
                    </Button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : profiles.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="h-12 w-12 text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">
                            {showArchived ? "No archived profiles" : "No profiles found"}
                        </h3>
                        <p className="text-slate-400">
                            {showArchived
                                ? "Archived profiles will appear here"
                                : "Profiles matching your filters will appear here"
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Select All */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedIds.size > 0 && selectedIds.size === profiles.length}
                            onCheckedChange={selectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm text-slate-400 cursor-pointer">
                            Select All ({profiles.length})
                        </Label>
                    </div>

                    {/* Profiles Table */}
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="w-10 p-3"></th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-400">Business Name</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-400">Client</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-400">Category</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-400">Reviews</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-400">Status</th>
                                    <th className="w-10 p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr
                                        key={profile.id}
                                        className={`border-t border-slate-700 hover:bg-slate-800/50 ${selectedIds.has(profile.id) ? "bg-slate-800/80" : ""}`}
                                    >
                                        <td className="p-3">
                                            <Checkbox
                                                checked={selectedIds.has(profile.id)}
                                                onCheckedChange={() => toggleSelect(profile.id)}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{profile.businessName}</span>
                                                {profile.gmbLink && (
                                                    <a
                                                        href={profile.gmbLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-indigo-400"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-300">{profile.client.name}</td>
                                        <td className="p-3">
                                            {profile.category ? (
                                                <Badge variant="outline" className="text-slate-300">
                                                    {profile.category}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-slate-300">{profile.reviewCount}</td>
                                        <td className="p-3">
                                            {profile.isArchived ? (
                                                <Badge variant="outline" className="text-orange-500">
                                                    Archived
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-600">
                                                    Active
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                    {profile.isArchived ? (
                                                        <DropdownMenuItem onClick={() => handleRestore(profile)}>
                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                            Restore
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleArchive(profile)}>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            setDeletingProfile(profile);
                                                            setPermanentDelete(true);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Permanently
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-slate-300">
                                Page {page} of {totalPages || 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                            {permanentDelete ? "Delete Permanently?" : "Archive Profile?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {permanentDelete
                                ? `This will permanently delete "${deletingProfile?.businessName}" and all associated reviews. This cannot be undone.`
                                : `This will archive "${deletingProfile?.businessName}". You can restore it later.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={permanentDelete ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            {permanentDelete ? "Delete" : "Archive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                            Delete {selectedIds.size} Profiles Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete the selected profiles and all their reviews. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={bulkActionLoading}
                        >
                            {bulkActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete {selectedIds.size} Profiles
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
