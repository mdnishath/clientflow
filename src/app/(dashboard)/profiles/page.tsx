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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Profile {
    id: string;
    businessName: string;
    gmbLink: string | null;
    category: string | null;
    isArchived: boolean;
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

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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
        reviewLimit: "",
        reviewsStartDate: "",
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

    useEffect(() => {
        fetchCategories();
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
                    reviewLimit: "",
                    reviewsStartDate: "",
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
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Profile
                </Button>
            </div>

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

            {/* Loading */}
            {loading ? (
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
                    {/* Profiles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profiles.map((profile) => (
                            <Card
                                key={profile.id}
                                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white">
                                                {profile.businessName}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {profile.client.name}
                                            </p>
                                        </div>
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

                                    <div className="flex items-center gap-2 mb-3">
                                        {profile.category ? (
                                            <Badge
                                                variant="outline"
                                                className="text-slate-300 border-slate-600"
                                            >
                                                {profile.category}
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-slate-500 border-slate-700"
                                            >
                                                No category
                                            </Badge>
                                        )}
                                        <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30">
                                            <Star className="h-3 w-3 mr-1" />
                                            {profile.reviewCount || 0} reviews
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/profiles/${profile.id}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                View Reviews
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                    )}
                </>
            )}

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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reviewLimit" className="text-slate-300">
                                    Daily Review Limit
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
        </div>
    );
}
