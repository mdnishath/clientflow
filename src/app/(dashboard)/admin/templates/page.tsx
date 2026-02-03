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
import { Plus, Edit, Trash2, FileText, Loader2, ChevronLeft, ChevronRight, Filter, Archive, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface Template {
    id: string;
    name: string;
    lines: number;
    promptInstruction: string;
    exampleOutput: string | null;
    namePosition: string;
    category: string | null;
    tags: string[];
    usageCount: number;
    isActive: boolean;
}

interface CategoryOption {
    slug: string;
    name: string;
}

const ITEMS_PER_PAGE = 10;

interface FormData {
    name: string;
    lines: number;
    promptInstruction: string;
    exampleOutput: string;
    namePosition: string;
    category: string;
    tags: string[];
}

const EMPTY_TEMPLATE: FormData = {
    name: "",
    lines: 2,
    promptInstruction: "",
    exampleOutput: "",
    namePosition: "none",
    category: "GENERAL",
    tags: [],
};

export default function TemplatesAdminPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<FormData>(EMPTY_TEMPLATE);
    const [isSaving, setIsSaving] = useState(false);

    // Filtering & Pagination
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Categories from API
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    useEffect(() => {
        fetchTemplates();
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

    const fetchTemplates = async () => {
        try {
            const res = await fetch("/api/templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load templates");
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered templates
    const filteredTemplates = useMemo(() => {
        if (filterCategory === "all") return templates;
        return templates.filter((t) => t.category === filterCategory);
    }, [templates, filterCategory]);

    // Pagination
    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
    const paginatedTemplates = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTemplates, currentPage]);

    // Get categories with counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        templates.forEach((t) => {
            const cat = t.category || "GENERAL";
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [templates]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]); // Clear selection on filter change
    }, [filterCategory]);

    // Toggle single selection
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Select all on current page
    const selectAllOnPage = () => {
        const pageIds = paginatedTemplates.map((t) => t.id);
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
        if (!confirm(`Archive ${selectedIds.length} template(s)?`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/templates/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: false }),
                    })
                )
            );
            toast.success(`${selectedIds.length} template(s) archived`);
            setSelectedIds([]);
            fetchTemplates();
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
        if (!confirm(`Permanently delete ${selectedIds.length} template(s)? This cannot be undone.`)) return;

        setIsBulkProcessing(true);
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/templates/${id}`, { method: "DELETE" })
                )
            );
            toast.success(`${selectedIds.length} template(s) deleted`);
            setSelectedIds([]);
            fetchTemplates();
        } catch (error) {
            console.error("Bulk delete error:", error);
            toast.error("Failed to delete");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const openCreateDialog = () => {
        setEditingTemplate(null);
        setFormData(EMPTY_TEMPLATE);
        setIsDialogOpen(true);
    };

    const openEditDialog = (template: Template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            lines: template.lines,
            promptInstruction: template.promptInstruction,
            exampleOutput: template.exampleOutput || "",
            namePosition: template.namePosition,
            category: template.category || "GENERAL",
            tags: template.tags,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.promptInstruction) {
            toast.error("Name and instruction required");
            return;
        }

        setIsSaving(true);
        try {
            const url = editingTemplate
                ? `/api/templates/${editingTemplate.id}`
                : "/api/templates";
            const method = editingTemplate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingTemplate ? "Template updated!" : "Template created!");
                setIsDialogOpen(false);
                fetchTemplates();
            } else {
                toast.error("Failed to save");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Error saving template");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return;

        try {
            const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Template deleted");
                fetchTemplates();
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete");
        }
    };

    const toggleActive = async (template: Template) => {
        try {
            await fetch(`/api/templates/${template.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !template.isActive }),
            });
            fetchTemplates();
        } catch (error) {
            console.error("Toggle error:", error);
        }
    };

    const getLinesBadgeColor = (lines: number) => {
        if (lines === 1) return "bg-green-600/20 text-green-400";
        if (lines === 2) return "bg-yellow-600/20 text-yellow-400";
        return "bg-red-600/20 text-red-400";
    };

    const allPageSelected = paginatedTemplates.length > 0 && paginatedTemplates.every((t) => selectedIds.includes(t.id));

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-indigo-400" />
                        Template Management
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {templates.length} templates • Organized by business category
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-500">
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Button>
            </div>

            {/* Filter Bar + Bulk Actions */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-400">Category:</span>
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all">All Categories ({templates.length})</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.slug} value={cat.slug}>
                                            {cat.name} ({categoryCounts[cat.slug] || 0})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="border-slate-600 text-slate-400">
                                Showing {paginatedTemplates.length} of {filteredTemplates.length}
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
                                    <Badge className="bg-indigo-600 text-white">
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

            {/* Templates Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
            ) : paginatedTemplates.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">
                            {filterCategory === "all"
                                ? "No templates yet. Create your first one!"
                                : `No templates in ${filterCategory} category`}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paginatedTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`border-slate-700 transition-all ${selectedIds.includes(template.id)
                                ? "ring-2 ring-indigo-500 bg-indigo-600/10"
                                : template.isActive
                                    ? "bg-slate-800/50"
                                    : "bg-slate-900/50 opacity-60"
                                }`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedIds.includes(template.id)}
                                            onCheckedChange={() => toggleSelection(template.id)}
                                            className="border-slate-500"
                                        />
                                        <CardTitle className="text-base text-white">{template.name}</CardTitle>
                                    </div>
                                    <Switch
                                        checked={template.isActive}
                                        onCheckedChange={() => toggleActive(template)}
                                    />
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap ml-6">
                                    <Badge className={getLinesBadgeColor(template.lines)}>
                                        {template.lines}L
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                                        {template.namePosition === "none" ? "No name" : template.namePosition}
                                    </Badge>
                                    {template.category && (
                                        <Badge variant="outline" className="border-purple-600/50 text-purple-400">
                                            {template.category}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="ml-6">
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                    {template.promptInstruction.slice(0, 100)}...
                                </p>
                                {template.exampleOutput && (
                                    <p className="text-xs text-slate-400 italic mb-2">
                                        "{template.exampleOutput.slice(0, 50)}..."
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Used {template.usageCount}x
                                    </span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(template)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        >
                                            <Edit size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(template.id)}
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
                            {editingTemplate ? "Edit Template" : "Create Template"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Name + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Roofing Quick Praise"
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
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
                        </div>

                        {/* Lines + Name Position */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Lines</Label>
                                <Select
                                    value={String(formData.lines)}
                                    onValueChange={(v) => setFormData({ ...formData, lines: Number(v) })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="1">1 line (Short)</SelectItem>
                                        <SelectItem value="2">2 lines (Medium)</SelectItem>
                                        <SelectItem value="3">3 lines (Long)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Business Name Position</Label>
                                <Select
                                    value={formData.namePosition}
                                    onValueChange={(v) => setFormData({ ...formData, namePosition: v })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="start">Start</SelectItem>
                                        <SelectItem value="middle">Middle</SelectItem>
                                        <SelectItem value="end">End</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Prompt Instruction */}
                        <div>
                            <Label>Prompt Instruction</Label>
                            <Textarea
                                value={formData.promptInstruction}
                                onChange={(e) => setFormData({ ...formData, promptInstruction: e.target.value })}
                                placeholder="Write 2 casual sentences about the roofing service..."
                                className="bg-slate-800 border-slate-700 min-h-[120px]"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Use {"{businessName}"} where the business name should appear
                            </p>
                        </div>

                        {/* Example Output */}
                        <div>
                            <Label>Example Output</Label>
                            <Input
                                value={formData.exampleOutput}
                                onChange={(e) => setFormData({ ...formData, exampleOutput: e.target.value })}
                                placeholder="e.g., Great roofing work! Very satisfied."
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTemplate ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
