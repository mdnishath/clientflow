"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users, Loader2, ChevronLeft, ChevronRight, Filter, Sparkles, Archive, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface Context {
    id: string;
    type: string;
    title: string;
    content: string;
    category: string | null;
    tone: string | null;
    usageCount: number;
    isActive: boolean;
}

interface CategoryOption {
    slug: string;
    name: string;
}

const TONES = [
    "authentic",
    "enthusiastic",
    "casual",
    "professional",
    "grateful",
    "brief",
    "detailed",
];

const ITEMS_PER_PAGE = 10;

interface FormData {
    type: string;
    title: string;
    content: string;
    category: string;
    tone: string;
}

const EMPTY_CONTEXT: FormData = {
    type: "persona",
    title: "",
    content: "",
    category: "GENERAL",
    tone: "authentic",
};

export default function ContextsAdminPage() {
    const [contexts, setContexts] = useState<Context[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingContext, setEditingContext] = useState<Context | null>(null);
    const [formData, setFormData] = useState<FormData>(EMPTY_CONTEXT);
    const [isSaving, setIsSaving] = useState(false);

    // Filtering & Pagination
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Categories from API
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    useEffect(() => {
        fetchContexts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories?activeOnly=true");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name })));
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const fetchContexts = async () => {
        try {
            const res = await fetch("/api/contexts");
            if (res.ok) {
                const data = await res.json();
                setContexts(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load contexts");
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered contexts
    const filteredContexts = useMemo(() => {
        return contexts.filter((c) => {
            const categoryMatch = filterCategory === "all" || c.category === filterCategory;
            const typeMatch = filterType === "all" || c.type === filterType;
            return categoryMatch && typeMatch;
        });
    }, [contexts, filterCategory, filterType]);

    // Pagination
    const totalPages = Math.ceil(filteredContexts.length / ITEMS_PER_PAGE);
    const paginatedContexts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContexts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredContexts, currentPage]);

    // Get counts
    const typeCounts = useMemo(() => {
        const counts = { persona: 0, scenario: 0 };
        contexts.forEach((c) => {
            if (c.type === "persona") counts.persona++;
            else if (c.type === "scenario") counts.scenario++;
        });
        return counts;
    }, [contexts]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [filterCategory, filterType]);

    // Toggle single selection
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Select all on current page
    const selectAllOnPage = () => {
        const pageIds = paginatedContexts.map((c) => c.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    // Bulk archive (set isActive = false)
    const handleBulkArchive = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Archive ${selectedIds.length} context(s)?`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/contexts/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: false }),
                    })
                )
            );
            toast.success(`${selectedIds.length} context(s) archived`);
            setSelectedIds([]);
            fetchContexts();
        } catch (error) {
            console.error("Bulk archive error:", error);
            toast.error("Failed to archive");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Permanently delete ${selectedIds.length} context(s)? This cannot be undone.`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/contexts/${id}`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} context(s) deleted`);
            setSelectedIds([]);
            fetchContexts();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Failed to delete");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const openCreateDialog = () => {
        setEditingContext(null);
        setFormData(EMPTY_CONTEXT);
        setIsDialogOpen(true);
    };

    const openEditDialog = (context: Context) => {
        setEditingContext(context);
        setFormData({
            type: context.type,
            title: context.title,
            content: context.content,
            category: context.category || "GENERAL",
            tone: context.tone || "authentic",
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            toast.error("Title and content required");
            return;
        }

        setIsSaving(true);
        try {
            const url = editingContext
                ? `/api/contexts/${editingContext.id}`
                : "/api/contexts";
            const method = editingContext ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingContext ? "Context updated!" : "Context created!");
                setIsDialogOpen(false);
                fetchContexts();
            } else {
                toast.error("Failed to save");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Error saving context");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this context?")) return;

        try {
            const res = await fetch(`/api/contexts/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Context deleted");
                fetchContexts();
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete");
        }
    };

    const toggleActive = async (context: Context) => {
        try {
            await fetch(`/api/contexts/${context.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !context.isActive }),
            });
            fetchContexts();
        } catch (error) {
            console.error("Toggle error:", error);
        }
    };

    const getTypeBadgeColor = (type: string) => {
        return type === "persona"
            ? "bg-blue-600/20 text-blue-400"
            : "bg-purple-600/20 text-purple-400";
    };

    const allPageSelected = paginatedContexts.length > 0 && paginatedContexts.every((c) => selectedIds.includes(c.id));

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Sparkles className="text-purple-400" />
                        Context Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {typeCounts.persona} personas • {typeCounts.scenario} scenarios
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-500">
                    <Plus className="mr-2 h-4 w-4" />
                    New Context
                </Button>
            </div>

            {/* Filter Bar + Bulk Actions */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Filters:</span>
                            </div>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="persona">Persona ({typeCounts.persona})</SelectItem>
                                    <SelectItem value="scenario">Scenario ({typeCounts.scenario})</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-36 bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                                Showing {paginatedContexts.length} of {filteredContexts.length}
                            </Badge>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllOnPage}
                                className="border-slate-700"
                            >
                                <CheckSquare size={14} className="mr-1" />
                                {allPageSelected ? "Deselect Page" : "Select Page"}
                            </Button>
                            {selectedIds.length > 0 && (
                                <>
                                    <Badge className="bg-purple-600 text-white">
                                        {selectedIds.length} selected
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkArchive}
                                        disabled={isBulkProcessing}
                                        className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Archive size={14} className="mr-1" />}
                                        Archive
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isBulkProcessing}
                                        className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} className="animate-spin mr-1" /> : <Trash2 size={14} className="mr-1" />}
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contexts Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                </div>
            ) : paginatedContexts.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No contexts found. Create some!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paginatedContexts.map((context) => (
                        <Card
                            key={context.id}
                            className={`border-slate-700 transition-all ${selectedIds.includes(context.id)
                                ? "ring-2 ring-purple-500 bg-purple-600/10"
                                : context.isActive
                                    ? "bg-slate-800/50"
                                    : "bg-slate-900/50 opacity-60"
                                }`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base text-white flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedIds.includes(context.id)}
                                            onCheckedChange={() => toggleSelection(context.id)}
                                            className="border-slate-500"
                                        />
                                        {context.type === "persona" ? (
                                            <Users size={16} className="text-blue-400" />
                                        ) : (
                                            <Sparkles size={16} className="text-purple-400" />
                                        )}
                                        {context.title}
                                    </CardTitle>
                                    <Switch
                                        checked={context.isActive}
                                        onCheckedChange={() => toggleActive(context)}
                                    />
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap ml-6">
                                    <Badge className={getTypeBadgeColor(context.type)}>
                                        {context.type}
                                    </Badge>
                                    {context.category && (
                                        <Badge variant="outline" className="border-indigo-600/50 text-indigo-400">
                                            {context.category}
                                        </Badge>
                                    )}
                                    {context.tone && (
                                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                                            {context.tone}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="ml-6">
                                <p className="text-xs text-slate-400 line-clamp-3 mb-2">
                                    {context.content}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Used {context.usageCount}x
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(context)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(context.id)}
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-slate-700"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-slate-700"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingContext ? "Edit Context" : "Create Context"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Type + Title */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="persona">Persona (Who is writing)</SelectItem>
                                        <SelectItem value="scenario">Scenario (What happened)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Homeowner with roof leak"
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Category + Tone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Business Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Tone</Label>
                                <Select
                                    value={formData.tone}
                                    onValueChange={(v) => setFormData({ ...formData, tone: v })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {TONES.map((tone) => (
                                            <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <Label>Content (Description)</Label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder={
                                    formData.type === "persona"
                                        ? "A homeowner who just got their roof repaired after a storm..."
                                        : "Customer came for roof inspection, technician was on time..."
                                }
                                className="bg-slate-800 border-slate-700 min-h-[120px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingContext ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
