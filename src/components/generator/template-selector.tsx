"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shuffle, FileText, Check, Loader2, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";

interface Template {
    id: string;
    name: string;
    lines: number;
    namePosition: string;
    exampleOutput: string | null;
    category: string | null;
}

interface TemplateSelectorProps {
    selectedTemplateIds: string[]; // Multiple selection
    onSelect: (templateIds: string[]) => void;
    useRandom: boolean;
    onRandomChange: (useRandom: boolean) => void;
}

export function TemplateSelector({ selectedTemplateIds, onSelect, useRandom, onRandomChange }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const res = await fetch("/api/templates");
                if (res.ok) {
                    const data = await res.json();
                    setTemplates(data);
                }
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    // Group templates by category
    const templatesByCategory = useMemo(() => {
        const grouped: Record<string, Template[]> = {};
        templates.forEach((t) => {
            const cat = t.category || "GENERAL";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
        });
        return grouped;
    }, [templates]);

    const categories = Object.keys(templatesByCategory).sort();

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
    };

    const toggleTemplate = (templateId: string) => {
        if (selectedTemplateIds.includes(templateId)) {
            onSelect(selectedTemplateIds.filter((id) => id !== templateId));
        } else {
            onSelect([...selectedTemplateIds, templateId]);
        }
        // When selecting templates, turn off random
        if (useRandom) onRandomChange(false);
    };

    const selectAllInCategory = (cat: string) => {
        const catTemplates = templatesByCategory[cat] || [];
        const catIds = catTemplates.map((t) => t.id);
        const allSelected = catIds.every((id) => selectedTemplateIds.includes(id));

        if (allSelected) {
            onSelect(selectedTemplateIds.filter((id) => !catIds.includes(id)));
        } else {
            const newIds = catIds.filter((id) => !selectedTemplateIds.includes(id));
            onSelect([...selectedTemplateIds, ...newIds]);
        }
        if (useRandom) onRandomChange(false);
    };

    const handleRandomToggle = () => {
        onRandomChange(!useRandom);
        if (!useRandom) {
            // Turning on random - clear selections
            onSelect([]);
        }
    };

    const getLinesBadgeColor = (lines: number) => {
        if (lines === 1) return "bg-green-600/20 text-green-400 border-green-600/50";
        if (lines === 2) return "bg-yellow-600/20 text-yellow-400 border-yellow-600/50";
        return "bg-red-600/20 text-red-400 border-red-600/50";
    };

    const getDisplayText = () => {
        if (useRandom) return "Random (from all)";
        if (selectedTemplateIds.length === 0) return "Select templates...";
        if (selectedTemplateIds.length === 1) {
            const t = templates.find((t) => t.id === selectedTemplateIds[0]);
            return t?.name || "1 template";
        }
        return `${selectedTemplateIds.length} templates selected`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full max-w-md justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                    <div className="flex items-center gap-2">
                        {useRandom ? (
                            <Shuffle size={16} className="text-yellow-400" />
                        ) : (
                            <FileText size={16} className="text-indigo-400" />
                        )}
                        <span>{getDisplayText()}</span>
                    </div>
                    <span className="text-slate-500">Click to change</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        Template নির্বাচন (Category → Templates)
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-2">
                        {/* Random Option */}
                        <Card
                            className={`cursor-pointer transition-all ${useRandom
                                    ? "bg-yellow-600/20 border-yellow-500"
                                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                                }`}
                            onClick={handleRandomToggle}
                        >
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shuffle className="text-yellow-400" size={20} />
                                    <div>
                                        <p className="font-medium">Random (সব category থেকে)</p>
                                        <p className="text-xs text-slate-400">প্রতিটা review-এ random template</p>
                                    </div>
                                </div>
                                <Checkbox checked={useRandom} className="border-yellow-500" />
                            </CardContent>
                        </Card>

                        <div className="border-t border-slate-700 my-2" />

                        {/* Categories with Templates */}
                        {categories.map((category) => {
                            const catTemplates = templatesByCategory[category];
                            const selectedInCat = catTemplates.filter((t) =>
                                selectedTemplateIds.includes(t.id)
                            ).length;
                            const isExpanded = expandedCategories[category];

                            return (
                                <Collapsible key={category} open={isExpanded}>
                                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                                        {/* Category Header */}
                                        <div
                                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${selectedInCat > 0
                                                    ? "bg-indigo-600/10 border-b border-indigo-500/30"
                                                    : "bg-slate-800 hover:bg-slate-750"
                                                }`}
                                        >
                                            <CollapsibleTrigger
                                                className="flex items-center gap-2 flex-1"
                                                onClick={() => toggleCategory(category)}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown size={16} className="text-slate-400" />
                                                ) : (
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                )}
                                                <FolderOpen size={16} className="text-indigo-400" />
                                                <span className="font-medium">{category}</span>
                                                <Badge variant="outline" className="border-slate-600 text-slate-400 ml-2">
                                                    {catTemplates.length}
                                                </Badge>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                {selectedInCat > 0 && (
                                                    <Badge className="bg-indigo-600 text-white">
                                                        {selectedInCat}
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        selectAllInCategory(category);
                                                    }}
                                                >
                                                    {selectedInCat === catTemplates.length ? "Deselect All" : "Select All"}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Templates in Category */}
                                        <CollapsibleContent>
                                            <div className="p-2 space-y-1 bg-slate-900/50">
                                                {catTemplates.map((template) => (
                                                    <div
                                                        key={template.id}
                                                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedTemplateIds.includes(template.id)
                                                                ? "bg-indigo-600/20 border border-indigo-500"
                                                                : "bg-slate-800/30 border border-transparent hover:border-slate-600"
                                                            }`}
                                                        onClick={() => toggleTemplate(template.id)}
                                                    >
                                                        <Checkbox
                                                            checked={selectedTemplateIds.includes(template.id)}
                                                            className="border-slate-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-medium">{template.name}</span>
                                                                <Badge variant="outline" className={getLinesBadgeColor(template.lines)}>
                                                                    {template.lines}L
                                                                </Badge>
                                                            </div>
                                                            {template.exampleOutput && (
                                                                <p className="text-xs text-slate-500 truncate mt-1">
                                                                    "{template.exampleOutput}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            );
                        })}
                    </div>
                )}

                <DialogFooter className="mt-4">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-slate-400">
                            {useRandom
                                ? "Random mode enabled"
                                : `${selectedTemplateIds.length} template(s) selected`}
                        </span>
                        <Button onClick={() => setIsOpen(false)} className="bg-indigo-600">
                            Done
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
