"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Store,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    Pencil,
    Search,
    Archive,
    RotateCcw,
    Trash2,
    MoreHorizontal,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { ClientForm } from "@/components/clients/client-form";
import { ProfileForm } from "@/components/profiles/profile-form";
import { toast } from "sonner";
import { ProfileCard } from "@/components/profiles/profile-card";

interface GmbProfile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
    createdAt: string;
    reviewCount?: number;
    _count?: { reviews: number };
}

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    isArchived: boolean;
    _count: { gmbProfiles: number };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { can } = useAuth();
    const [client, setClient] = useState<Client | null>(null);
    const [profiles, setProfiles] = useState<GmbProfile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profilesLoading, setProfilesLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showArchived, setShowArchived] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Multi-select
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Dialogs
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [deletingProfile, setDeletingProfile] = useState<GmbProfile | null>(null);

    const fetchClient = async () => {
        try {
            const res = await fetch(`/api/clients/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setClient(data);
            }
        } catch (error) {
            console.error("Failed to fetch client:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfiles = useCallback(async () => {
        if (!params.id) return;

        try {
            setProfilesLoading(true);
            const queryParams = new URLSearchParams({
                clientId: params.id as string,
                fullData: "true",
                page: page.toString(),
                limit: limit.toString(),
            });

            if (showArchived) {
                queryParams.set("archivedOnly", "true");
            }
            if (search) {
                queryParams.set("search", search);
            }
            if (categoryFilter !== "all") {
                queryParams.set("category", categoryFilter);
            }

            const res = await fetch(`/api/profiles?${queryParams}`);
            if (res.ok) {
                const data = await res.json();
                setProfiles(data.profiles || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error("Failed to fetch profiles:", error);
        } finally {
            setProfilesLoading(false);
        }
    }, [params.id, page, showArchived, search, categoryFilter]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?activeOnly=true");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchClient();
        fetchCategories();
    }, [params.id]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
        setSelectedIds(new Set());
    }, [showArchived, search, categoryFilter]);

    // Profile actions
    const handleArchive = async (profile: GmbProfile) => {
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to archive");
            toast.success(`"${profile.businessName}" archived`);
            fetchProfiles();
            fetchClient();
        } catch {
            toast.error("Failed to archive profile");
        }
    };

    const handleRestore = async (profile: GmbProfile) => {
        try {
            const res = await fetch(`/api/profiles/${profile.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: false }),
            });
            if (!res.ok) throw new Error("Failed to restore");
            toast.success(`"${profile.businessName}" restored`);
            fetchProfiles();
            fetchClient();
        } catch {
            toast.error("Failed to restore profile");
        }
    };

    const handleDelete = async () => {
        if (!deletingProfile) return;

        try {
            const res = await fetch(`/api/profiles/${deletingProfile.id}?permanent=true`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.details || data.error || "Failed to delete");
            }

            toast.success(`"${deletingProfile.businessName}" permanently deleted`);
            setDeleteDialogOpen(false);
            setDeletingProfile(null);
            fetchProfiles();
            fetchClient();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete profile");
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
                body: JSON.stringify({ ids: Array.from(selectedIds), action: "archive" }),
            });

            if (!res.ok) throw new Error("Failed to archive");
            toast.success(`${selectedIds.size} profiles archived`);
            setSelectedIds(new Set());
            fetchProfiles();
            fetchClient();
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
            fetchClient();
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
            fetchClient();
        } catch {
            toast.error("Failed to delete profiles");
        } finally {
            setBulkActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-6 lg:p-8 pt-16 lg:pt-8">
                <div className="text-slate-500">Client not found</div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Back button */}
            <Link
                href="/clients"
                className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6"
            >
                <ArrowLeft size={16} className="mr-2" />
                Back to Clients
            </Link>

            {/* Client Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                            {client.name}
                        </h1>
                        {client.isArchived && (
                            <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                                Archived
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                        {client.email && (
                            <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {client.email}
                            </span>
                        )}
                        {client.phone && (
                            <span className="flex items-center gap-1">
                                <Phone size={14} />
                                {client.phone}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(true)}
                    className="border-slate-700 text-slate-300 hover:text-white"
                >
                    <Pencil size={16} className="mr-2" />
                    Edit Client
                </Button>
            </div>

            {/* Notes */}
            {client.notes && (
                <Card className="bg-slate-800/30 border-slate-700 mb-8">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                            <FileText size={16} className="text-slate-500 mt-0.5" />
                            <p className="text-sm text-slate-400">{client.notes}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* GMB Profiles Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Store size={20} className="text-indigo-400" />
                    GMB Profiles
                </h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="show-archived"
                            checked={showArchived}
                            onCheckedChange={setShowArchived}
                        />
                        <Label htmlFor="show-archived" className="text-sm text-slate-300">
                            {showArchived ? "Archived" : "Active"}
                        </Label>
                    </div>
                    {can.addProfiles && (
                        <Button
                            onClick={() => setIsProfileFormOpen(true)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus size={16} className="mr-2" />
                            Add Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search profiles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700 text-white"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-white">
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

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3">
                        <p className="text-xs text-slate-400">
                            {showArchived ? "Archived" : "Active"}
                        </p>
                        <p className="text-xl font-bold text-white">{total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3">
                        <p className="text-xs text-slate-400">Selected</p>
                        <p className="text-xl font-bold text-indigo-400">{selectedIds.size}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-3">
                        <p className="text-xs text-slate-400">Page</p>
                        <p className="text-xl font-bold text-slate-300">{page}/{totalPages || 1}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 mb-4">
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
                            Restore
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
                            Archive
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                        disabled={bulkActionLoading}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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

            {/* Profiles List */}
            {profilesLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : profiles.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">
                            {showArchived ? "No archived profiles" : "No profiles found"}
                        </h3>
                        <p className="text-slate-500">
                            {showArchived
                                ? "Archived profiles will appear here"
                                : search || categoryFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Add your first GMB profile!"
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Select All */}
                    <div className="flex items-center gap-2 mb-3">
                        <Checkbox
                            id="select-all"
                            checked={selectedIds.size > 0 && selectedIds.size === profiles.length}
                            onCheckedChange={selectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm text-slate-400 cursor-pointer">
                            Select All ({profiles.length})
                        </Label>
                    </div>

                    {/* Profiles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {profiles.map((profile) => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                isSelected={selectedIds.has(profile.id)}
                                onToggleSelect={() => toggleSelect(profile.id)}
                                onArchive={can.deleteProfiles ? (p) => handleArchive(p as unknown as GmbProfile) : undefined}
                                onRestore={can.deleteProfiles ? (p) => handleRestore(p as unknown as GmbProfile) : undefined}
                                onDelete={can.deleteProfiles ? (p) => {
                                    setDeletingProfile(p as unknown as GmbProfile);
                                    setDeleteDialogOpen(true);
                                } : undefined}
                                isAdmin={true} // Since we are on client detail page, show admin controls if permitted
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                                    {page} / {totalPages}
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
                    )}
                </>
            )}

            {/* Edit Client Dialog */}
            <ClientForm
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                client={client}
                onSuccess={() => {
                    fetchClient();
                    fetchProfiles();
                }}
            />

            {/* Profile Form */}
            <ProfileForm
                open={isProfileFormOpen}
                onOpenChange={setIsProfileFormOpen}
                clientId={client.id}
                onSuccess={() => {
                    fetchClient();
                    fetchProfiles();
                }}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                            Delete Profile Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete &quot;{deletingProfile?.businessName}&quot; and all associated reviews. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
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
                        <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                            Cancel
                        </AlertDialogCancel>
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
