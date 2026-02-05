"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Monitor, Wrench, Home, Briefcase, HeartPulse, Scale, Scissors, Truck, Info } from "lucide-react";
import { MASTER_PROMPTS_DATA } from "@/lib/master-prompts-data";

interface MasterPromptSelectorProps {
    onSelect: (prompt: string) => void;
}

export function MasterPromptSelector({ onSelect }: MasterPromptSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(MASTER_PROMPTS_DATA.map(p => p.category));
        return Array.from(cats).sort();
    }, []);

    // Filter prompts based on search and category
    const filteredPrompts = useMemo(() => {
        return MASTER_PROMPTS_DATA.filter(p => {
            const matchesSearch =
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.prompt.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory ? p.category === selectedCategory : true;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    // Group for display if no search active
    const displayPrompts = filteredPrompts;

    return (
        <div className="mt-6 border border-slate-700 rounded-xl bg-slate-900/50 overflow-hidden">
            {/* Header / Search */}
            <div className="p-4 border-b border-slate-700 bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        Prompt Library ({MASTER_PROMPTS_DATA.length}+ Presets)
                    </label>
                    <Badge variant="outline" className="text-xs border-slate-600">
                        {filteredPrompts.length} found
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by industry (e.g. plumber, roof)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-800 border-slate-700 text-white h-9 text-sm"
                        />
                    </div>
                </div>

                {/* Quick Category Chips */}
                {!searchTerm && (
                    <div className="flex gap-2 overflow-x-auto mt-3 pb-1 custom-scrollbar">
                        <Button
                            variant={selectedCategory === null ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="h-7 text-xs whitespace-nowrap"
                        >
                            All
                        </Button>
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                className={`h-7 text-xs whitespace-nowrap border border-transparent ${selectedCategory === cat ? "bg-slate-700" : "text-slate-400 border-slate-700 hover:text-white"}`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Area */}
            <div className="h-[250px] overflow-y-auto custom-scrollbar p-2 bg-slate-950/30">
                {displayPrompts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Info size={24} />
                        <p className="text-sm">No prompts found for "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {displayPrompts.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => onSelect(item.prompt)}
                                className="group relative p-3 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                    <Sparkles size={12} className="opacity-0 group-hover:opacity-100 text-yellow-500 transition-opacity" />
                                </div>
                                <h4 className="text-sm font-medium text-slate-200 mb-1 group-hover:text-white">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {item.prompt.substring(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
