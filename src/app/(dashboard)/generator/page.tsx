"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Wand2, Check, X, Languages, CheckCheck, FolderOpen } from "lucide-react";

import { toast } from "sonner";
import { MasterPromptSelector } from "@/components/generator/master-prompt-selector";

interface Profile {
    id: string;
    businessName: string;
    category: string | null;
}

interface TemplateInfo {
    id: number;
    name: string;
    lines: number;
}

interface GeneratedReview {
    id: string;
    french: string;
    bangla: string;
    profileId: string;
    profileName: string;
    template?: TemplateInfo;
}

export default function GeneratorPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [quantity, setQuantity] = useState<number>(5);
    const [userHint, setUserHint] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [generatedReviews, setGeneratedReviews] = useState<GeneratedReview[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [showBangla, setShowBangla] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function fetchProfiles() {
            try {
                const res = await fetch("/api/profiles?limit=1000"); // Load all profiles (up to 1000)
                if (res.ok) {
                    const data = await res.json();
                    setProfiles(data);
                }
            } catch (error) {
                console.error("Failed to fetch profiles:", error);
            }
        }
        fetchProfiles();
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        profiles.forEach((p) => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    }, [profiles]);

    // Group profiles by category
    const profilesByCategory = useMemo(() => {
        const grouped: Record<string, Profile[]> = {};
        profiles.forEach((p) => {
            const cat = p.category || "Uncategorized";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(p);
        });
        return grouped;
    }, [profiles]);

    // Filtered profiles based on selected category
    const filteredProfiles = useMemo(() => {
        if (selectedCategory === "all") return profiles;
        return profiles.filter((p) => (p.category || "Uncategorized") === selectedCategory);
    }, [profiles, selectedCategory]);

    // Get current category for generation context
    const activeCategory = useMemo(() => {
        if (selectedProfiles.length === 0) return null;
        const selectedProfileObjs = profiles.filter((p) => selectedProfiles.includes(p.id));
        const categories = new Set(selectedProfileObjs.map((p) => p.category || "GENERAL"));
        // If all selected have same category, use it
        return categories.size === 1 ? Array.from(categories)[0] : "GENERAL";
    }, [selectedProfiles, profiles]);

    const toggleProfile = (profileId: string) => {
        setSelectedProfiles((prev) =>
            prev.includes(profileId)
                ? prev.filter((id) => id !== profileId)
                : [...prev, profileId]
        );
    };

    const selectAllInCategory = (category: string) => {
        const profilesInCategory = profilesByCategory[category] || [];
        const idsInCategory = profilesInCategory.map((p) => p.id);
        const allSelected = idsInCategory.every((id) => selectedProfiles.includes(id));

        if (allSelected) {
            // Deselect all in this category
            setSelectedProfiles((prev) => prev.filter((id) => !idsInCategory.includes(id)));
        } else {
            // Select all in this category
            setSelectedProfiles((prev) => {
                const newIds = idsInCategory.filter((id) => !prev.includes(id));
                return [...prev, ...newIds];
            });
        }
    };

    const selectAllProfiles = () => {
        if (selectedProfiles.length === filteredProfiles.length) {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles(filteredProfiles.map((p) => p.id));
        }
    };

    const handleGenerate = async () => {
        if (selectedProfiles.length === 0) {
            toast.error("অন্তত একটা profile select করুন");
            return;
        }

        setIsLoading(true);
        setGeneratedReviews([]);
        const totalToGenerate = selectedProfiles.length * quantity;
        setProgress({ current: 0, total: totalToGenerate });

        const allResults: GeneratedReview[] = [];
        let currentCount = 0;

        const usePromptPriority = selectedProfiles.length === 1 && userHint.trim().length > 0;

        for (const profileId of selectedProfiles) {
            const profile = profiles.find((p) => p.id === profileId);
            if (!profile) continue;

            for (let i = 0; i < quantity; i++) {
                try {
                    const res = await fetch("/api/reviews/generate/dual", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            profileId,
                            userHint: userHint || undefined,
                            usePromptPriority,
                            templateId: null,
                            category: profile.category || "GENERAL",
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        allResults.push({
                            id: `${profileId}-${i}-${Date.now()}`,
                            french: data.french,
                            bangla: data.bangla,
                            profileId,
                            profileName: profile.businessName,
                            template: data.template,
                        });
                    }
                } catch (error) {
                    console.error("Generation error:", error);
                }

                currentCount++;
                setProgress({ current: currentCount, total: totalToGenerate });
                setGeneratedReviews([...allResults]);
            }
        }

        setIsLoading(false);
        toast.success(`✅ ${allResults.length}টা review তৈরি হয়েছে!`);
    };

    const handleApprove = async (review: GeneratedReview) => {
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: review.profileId,
                    reviewText: review.french,
                    status: "PENDING",
                    notes: `AI Generated - ${review.template?.name || "Custom"}`,
                }),
            });

            if (res.ok) {
                setGeneratedReviews((prev) => prev.filter((r) => r.id !== review.id));
                toast.success("✅ Review সেভ হয়েছে!");
            } else {
                toast.error("সেভ করতে সমস্যা হয়েছে");
            }
        } catch (error) {
            console.error("Approve error:", error);
            toast.error("Error saving review");
        }
    };

    const handleBulkApprove = async () => {
        if (generatedReviews.length === 0) return;

        setIsBulkApproving(true);
        let successCount = 0;

        for (const review of generatedReviews) {
            try {
                const res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        profileId: review.profileId,
                        reviewText: review.french,
                        status: "PENDING",
                        notes: `AI Generated - ${review.template?.name || "Custom"}`,
                    }),
                });

                if (res.ok) {
                    successCount++;
                }
            } catch (error) {
                console.error("Bulk approve error:", error);
            }
        }

        setGeneratedReviews([]);
        setIsBulkApproving(false);
        toast.success(`✅ ${successCount}টা review সেভ হয়েছে!`);
    };

    const handleDiscard = (reviewId: string) => {
        setGeneratedReviews((prev) => prev.filter((r) => r.id !== reviewId));
    };

    const toggleBangla = (reviewId: string) => {
        setShowBangla((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
    };

    const progressPercent = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Wand2 className="text-indigo-400" />
                        AI Review Generator
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Category-Based • Template Control • Bulk Approve
                    </p>
                </div>
            </div>

            {/* Controls */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                    <CardTitle className="text-lg text-white">
                        কনফিগারেশন (Configuration)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Category Filter */}
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                            Category Filter
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full max-w-md bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Categories ({profiles.length})</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat} ({profilesByCategory[cat]?.length || 0})
                                    </SelectItem>
                                ))}
                                {profilesByCategory["Uncategorized"] && (
                                    <SelectItem value="Uncategorized">
                                        Uncategorized ({profilesByCategory["Uncategorized"].length})
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Profile Selection by Category */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm text-slate-400">
                                Profile নির্বাচন ({selectedProfiles.length} selected)
                            </label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectAllProfiles}
                                className="text-indigo-400 hover:text-indigo-300"
                            >
                                {selectedProfiles.length === filteredProfiles.length
                                    ? "Deselect All"
                                    : `Select All (${filteredProfiles.length})`}
                            </Button>
                        </div>

                        {/* Category Groups */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto p-2 bg-slate-900/50 rounded-lg"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}
                        >
                            {Object.entries(profilesByCategory)
                                .filter(([cat]) => selectedCategory === "all" || cat === selectedCategory)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([category, categoryProfiles]) => {
                                    const selectedInCategory = categoryProfiles.filter((p) =>
                                        selectedProfiles.includes(p.id)
                                    ).length;
                                    const allSelectedInCategory = selectedInCategory === categoryProfiles.length;

                                    return (
                                        <div key={category} className="border border-slate-700 rounded-lg overflow-hidden">
                                            {/* Category Header */}
                                            <div
                                                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${allSelectedInCategory
                                                    ? "bg-indigo-600/20 border-b border-indigo-500"
                                                    : "bg-slate-800 border-b border-slate-700 hover:bg-slate-750"
                                                    }`}
                                                onClick={() => selectAllInCategory(category)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen size={16} className="text-indigo-400" />
                                                    <span className="font-medium text-white">{category}</span>
                                                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                                                        {categoryProfiles.length}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedInCategory > 0 && (
                                                        <Badge className="bg-indigo-600 text-white">
                                                            {selectedInCategory} selected
                                                        </Badge>
                                                    )}
                                                    <Checkbox
                                                        checked={allSelectedInCategory}
                                                        className="border-slate-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Profiles in Category */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                                                {categoryProfiles.map((profile) => (
                                                    <div
                                                        key={profile.id}
                                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${selectedProfiles.includes(profile.id)
                                                            ? "bg-indigo-600/20 border border-indigo-500"
                                                            : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                                                            }`}
                                                        onClick={() => toggleProfile(profile.id)}
                                                    >
                                                        <Checkbox
                                                            checked={selectedProfiles.includes(profile.id)}
                                                            className="border-slate-500 h-4 w-4"
                                                        />
                                                        <span className="text-white truncate">{profile.businessName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Active Category Info */}
                        {activeCategory && (
                            <p className="text-xs text-indigo-400 mt-2">
                                🎯 Context: {activeCategory} category-র জন্য optimized
                            </p>
                        )}
                    </div>

                    {/* Template Selector */}


                    {/* Quantity Slider */}
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">
                            প্রতি Profile-এ Review: <span className="text-white font-bold text-lg">{quantity}</span>
                        </label>
                        <Slider
                            value={[quantity]}
                            onValueChange={(val) => setQuantity(val[0])}
                            min={1}
                            max={50}
                            step={1}
                            className="w-full max-w-md"
                        />
                        <p className="text-xs text-indigo-400 mt-2">
                            মোট: {selectedProfiles.length * quantity} টা review
                        </p>
                    </div>

                    {/* Master Prompt Input */}
                    <div>
                        <MasterPromptSelector onSelect={setUserHint} />
                        <label className="text-sm text-slate-400 mb-2 block mt-4">
                            Master Prompt (Strict Instructions)
                            <span className="text-indigo-400 ml-2 text-xs">
                                ★ AI will strictly follow ONLY this prompt
                            </span>
                        </label>
                        <Textarea
                            value={userHint}
                            onChange={(e) => setUserHint(e.target.value)}
                            placeholder={`e.g.,
Context: Customer visited for coffee and croissant. Service was fast.
Word Limit: 30-50 words
Instructions: Mention the latte art and the friendly barista.`}
                            className="w-full max-w-md bg-slate-800 border-slate-700 text-white min-h-[120px]"
                        />
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || selectedProfiles.length === 0}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-6 text-lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-5 w-5" />
                                Generate {selectedProfiles.length * quantity} Reviews
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Progress Bar */}
            {isLoading && progress.total > 0 && (
                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Progress</span>
                            <span className="text-sm text-white">
                                {progress.current} / {progress.total} ({progressPercent}%)
                            </span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {generatedReviews.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">
                            Generated ({generatedReviews.length})
                        </h2>
                        <Button
                            onClick={handleBulkApprove}
                            disabled={isBulkApproving}
                            className="bg-green-600 hover:bg-green-500 text-white"
                        >
                            {isBulkApproving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-2 h-4 w-4" />
                            )}
                            Approve All ({generatedReviews.length})
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {generatedReviews.map((review) => (
                            <Card
                                key={review.id}
                                className="bg-slate-800/50 border-slate-700 transition-all hover:border-slate-600"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-indigo-400 font-medium">
                                                {review.profileName}
                                            </span>
                                            {review.template && (
                                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                                    {review.template.name} • {review.template.lines}L
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleBangla(review.id)}
                                            className="h-6 px-2 text-xs text-slate-400 hover:text-white"
                                        >
                                            <Languages className="h-3 w-3 mr-1" />
                                            {showBangla[review.id] ? "🇫🇷" : "🇧🇩"}
                                        </Button>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-xs">🇫🇷</span>
                                            <span className="text-xs text-slate-500">French</span>
                                        </div>
                                        <p className="text-slate-200 text-sm leading-relaxed">
                                            {review.french}
                                        </p>
                                    </div>

                                    {showBangla[review.id] && (
                                        <div className="mb-3 pt-3 border-t border-slate-700">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-xs">🇧🇩</span>
                                                <span className="text-xs text-slate-500">Bangla</span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                {review.bangla}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(review)}
                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDiscard(review.id)}
                                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
