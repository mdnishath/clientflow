"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    Plus, Edit, Trash2, Loader2, MoreHorizontal, Archive,
    RotateCcw, FileText, MessageSquare, FolderOpen, CheckSquare
} from "lucide-react";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
    isActive: boolean;
    isArchived: boolean;
    sortOrder: number;
    templateCount: number;
    contextCount: number;
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    sortOrder: number;
    isActive: boolean;
}

const EMPTY_FORM: FormData = {
    name: "",
    slug: "",
    description: "",
    icon: "📁",
    color: "#6366f1",
    sortOrder: 0,
    isActive: true,
};

const PRESET_ICONS = ["📁", "🏠", "🍽️", "🔧", "⚡", "❄️", "🌿", "🧹", "🦷", "🏥", "💇", "🚗", "⚖️", "🏡", "💪", "🛒", "🎨", "📦"];
const PRESET_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#3b82f6"];

export default function CategoriesAdminPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    // Multi-select
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [permanentDelete, setPermanentDelete] = useState(false);
    const [bulkPermanentDelete, setBulkPermanentDelete] = useState(false);

    // Form
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

    useEffect(() => {
        fetchCategories();
    }, [showArchived]);

    // Clear selection when toggle changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [showArchived]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Always fetch all categories, then filter client-side
            const res = await fetch(`/api/categories?includeArchived=true`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCategories(data);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    // Filter categories based on showArchived toggle
    const filteredCategories = showArchived
        ? categories.filter(c => c.isArchived)  // Show ONLY archived
        : categories.filter(c => !c.isArchived); // Show ONLY active

    const openCreateDialog = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (cat: Category) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            icon: cat.icon || "📁",
            color: cat.color || "#6366f1",
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            setSaving(true);
            const slug = formData.slug || formData.name.toUpperCase().replace(/\s+/g, "_");

            const payload = {
                ...formData,
                slug,
            };

            const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }

            toast.success(editingId ? "Category updated!" : "Category created!");
            setDialogOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (cat: Category) => {
        try {
            const res = await fetch(`/api/categories/${cat.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to archive");
            toast.success(`"${cat.name}" archived`);
            fetchCategories();
        } catch {
            toast.error("Failed to archive category");
        }
    };

    const handleRestore = async (cat: Category) => {
        try {
            const res = await fetch(`/api/categories/${cat.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isArchived: false }),
            });
            if (!res.ok) throw new Error("Failed to restore");
            toast.success(`"${cat.name}" restored`);
            fetchCategories();
        } catch {
            toast.error("Failed to restore category");
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;

        try {
            const url = permanentDelete
                ? `/api/categories/${deletingCategory.id}?permanent=true`
                : `/api/categories/${deletingCategory.id}`;

            const res = await fetch(url, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            toast.success(permanentDelete
                ? `"${deletingCategory.name}" permanently deleted`
                : `"${deletingCategory.name}" archived`
            );
            setDeleteDialogOpen(false);
            setDeletingCategory(null);
            setPermanentDelete(false);
            fetchCategories();
        } catch {
            toast.error("Failed to delete category");
        }
    };

    const toggleActive = async (cat: Category) => {
        try {
            const res = await fetch(`/api/categories/${cat.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !cat.isActive }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success(`"${cat.name}" ${!cat.isActive ? "activated" : "deactivated"}`);
            fetchCategories();
        } catch {
            toast.error("Failed to update category");
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
        const nonSystemIds = filteredCategories.filter(c => !c.isSystem).map(c => c.id);
        if (selectedIds.size === nonSystemIds.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(nonSystemIds));
        }
    };

    const handleBulkArchive = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const promises = Array.from(selectedIds).map(id =>
                fetch(`/api/categories/${id}`, { method: "DELETE" })
            );
            await Promise.all(promises);
            toast.success(`${selectedIds.size} categories archived`);
            setSelectedIds(new Set());
            fetchCategories();
        } catch {
            toast.error("Failed to archive categories");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const promises = Array.from(selectedIds).map(id =>
                fetch(`/api/categories/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isArchived: false }),
                })
            );
            await Promise.all(promises);
            toast.success(`${selectedIds.size} categories restored`);
            setSelectedIds(new Set());
            fetchCategories();
        } catch {
            toast.error("Failed to restore categories");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        try {
            setBulkActionLoading(true);
            const url = bulkPermanentDelete ? "?permanent=true" : "";
            const promises = Array.from(selectedIds).map(id =>
                fetch(`/api/categories/${id}${url}`, { method: "DELETE" })
            );
            await Promise.all(promises);
            toast.success(bulkPermanentDelete
                ? `${selectedIds.size} categories permanently deleted`
                : `${selectedIds.size} categories archived`
            );
            setSelectedIds(new Set());
            setBulkDeleteDialogOpen(false);
            setBulkPermanentDelete(false);
            fetchCategories();
        } catch {
            toast.error("Failed to delete categories");
        } finally {
            setBulkActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const nonSystemSelected = Array.from(selectedIds).filter(id => {
        const cat = categories.find(c => c.id === id);
        return cat && !cat.isSystem;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Category Management</h1>
                    <p className="text-slate-400">
                        Manage business categories for templates and contexts
                    </p>
                </div>
                <div className="flex items-center gap-4">
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
                    <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Active Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {categories.filter(c => !c.isArchived).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Archived Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">
                            {categories.filter(c => c.isArchived).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Enabled Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {categories.filter(c => c.isActive && !c.isArchived).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Total Templates/Contexts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                            {categories.reduce((sum, c) => sum + c.templateCount + c.contextCount, 0)}
                        </div>
                    </CardContent>
                </Card>
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
                        onClick={() => {
                            setBulkPermanentDelete(true);
                            setBulkDeleteDialogOpen(true);
                        }}
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

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FolderOpen className="h-12 w-12 text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">
                            {showArchived ? "No archived categories" : "No categories yet"}
                        </h3>
                        <p className="text-slate-400 mb-4">
                            {showArchived
                                ? "Archived categories will appear here"
                                : "Create your first category to organize templates and contexts"
                            }
                        </p>
                        {!showArchived && (
                            <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Select All */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="select-all"
                            checked={selectedIds.size > 0 && selectedIds.size === filteredCategories.filter(c => !c.isSystem).length}
                            onCheckedChange={selectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm text-slate-400 cursor-pointer">
                            Select All ({filteredCategories.filter(c => !c.isSystem).length})
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCategories.map((cat) => (
                            <Card
                                key={cat.id}
                                className={`relative bg-slate-800/50 border-slate-700 ${cat.isArchived ? "opacity-60 border-dashed" : ""} ${selectedIds.has(cat.id) ? "ring-2 ring-indigo-500" : ""}`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {!cat.isSystem && (
                                                <Checkbox
                                                    checked={selectedIds.has(cat.id)}
                                                    onCheckedChange={() => toggleSelect(cat.id)}
                                                />
                                            )}
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                                style={{ backgroundColor: `${cat.color}20` }}
                                            >
                                                {cat.icon || "📁"}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-white">{cat.name}</CardTitle>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    {cat.slug}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                <DropdownMenuItem onClick={() => openEditDialog(cat)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleActive(cat)}>
                                                    <CheckSquare className="mr-2 h-4 w-4" />
                                                    {cat.isActive ? "Deactivate" : "Activate"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {cat.isArchived ? (
                                                    <DropdownMenuItem onClick={() => handleRestore(cat)}>
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        Restore
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleArchive(cat)}>
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                                {!cat.isSystem && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            setDeletingCategory(cat);
                                                            setPermanentDelete(true);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Permanently
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {cat.description && (
                                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                            {cat.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4 text-blue-400" />
                                            <span>{cat.templateCount} templates</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4 text-green-400" />
                                            <span>{cat.contextCount} contexts</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge variant={cat.isActive ? "default" : "secondary"}>
                                            {cat.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                        {cat.isArchived && (
                                            <Badge variant="outline" className="text-orange-500">
                                                Archived
                                            </Badge>
                                        )}
                                        {cat.isSystem && (
                                            <Badge variant="outline" className="text-purple-500">
                                                System
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? "Edit Category" : "New Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId
                                ? "Update category details"
                                : "Create a new business category"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-200">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    name: e.target.value,
                                    slug: e.target.value.toUpperCase().replace(/\s+/g, "_")
                                })}
                                placeholder="e.g., Roofing Contractor"
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-slate-200">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="Auto-generated from name"
                                className="font-mono text-sm bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-200">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category"
                                rows={2}
                                className="bg-slate-700/50 border-slate-600 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-200">Icon</Label>
                                <div className="flex flex-wrap gap-1">
                                    {PRESET_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-slate-600 ${formData.icon === icon ? "bg-slate-600 ring-2 ring-indigo-500" : ""}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-200">Color</Label>
                                <div className="flex flex-wrap gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-6 h-6 rounded-full ${formData.color === color ? "ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-500" : ""}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isActive" className="text-slate-200">Active</Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                            {permanentDelete ? "Delete Permanently?" : "Archive Category?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {permanentDelete
                                ? `This will permanently delete "${deletingCategory?.name}" and remove it from all templates and contexts. This cannot be undone.`
                                : `This will archive "${deletingCategory?.name}". You can restore it later.`
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
                            Delete {nonSystemSelected.length} Categories Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete the selected categories and remove them from all templates and contexts. This cannot be undone.
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
                            Delete {nonSystemSelected.length} Categories
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
