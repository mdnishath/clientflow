"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Store, Users, Loader2, X, Command } from "lucide-react";
import { useDebounce } from "use-debounce";

interface SearchResult {
    type: "review" | "profile" | "client";
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    url: string;
}

const typeConfig = {
    review: { icon: Star, label: "Review", color: "text-green-400" },
    profile: { icon: Store, label: "Profile", color: "text-blue-400" },
    client: { icon: Users, label: "Client", color: "text-purple-400" },
};

const statusColors: Record<string, string> = {
    LIVE: "bg-green-500/20 text-green-400",
    DONE: "bg-emerald-500/20 text-emerald-400",
    PENDING: "bg-slate-500/20 text-slate-400",
    APPLIED: "bg-purple-500/20 text-purple-400",
    MISSING: "bg-yellow-500/20 text-yellow-400",
};

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 300);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Keyboard shortcut — Ctrl+K or Cmd+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setResults([]);
            setSelected(0);
        }
    }, [open]);

    // Search
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
            .then(r => r.json())
            .then(data => {
                setResults(data.results || []);
                setSelected(0);
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [debouncedQuery]);

    const navigate = useCallback((result: SearchResult) => {
        router.push(result.url);
        setOpen(false);
    }, [router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelected(s => Math.min(s + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelected(s => Math.max(s - 1, 0));
        } else if (e.key === "Enter" && results[selected]) {
            navigate(results[selected]);
        }
    };

    if (!open) return (
        <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm w-full max-w-[220px]"
        >
            <Search size={14} />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-0.5 text-slate-600">
                <Command size={10} />
                <span className="text-xs">K</span>
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Search modal */}
            <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search reviews, profiles, clients..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base"
                    />
                    {loading && <Loader2 size={16} className="text-slate-400 animate-spin" />}
                    <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="max-h-80 overflow-y-auto py-2">
                        {results.map((result, i) => {
                            const config = typeConfig[result.type];
                            const Icon = config.icon;
                            const isSelected = i === selected;
                            return (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => navigate(result)}
                                    onMouseEnter={() => setSelected(i)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${isSelected ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
                                >
                                    <div className={`h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ${config.color}`}>
                                        <Icon size={15} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{result.title}</p>
                                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                    </div>
                                    {result.badge && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[result.badge] || "bg-slate-700 text-slate-400"}`}>
                                            {result.badge}
                                        </span>
                                    )}
                                    <span className={`text-xs px-1.5 py-0.5 rounded bg-slate-800 ${config.color} shrink-0`}>
                                        {config.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {query.length >= 2 && !loading && results.length === 0 && (
                    <div className="py-10 text-center text-slate-500">
                        <Search size={24} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No results for "{query}"</p>
                    </div>
                )}

                {query.length < 2 && (
                    <div className="px-4 py-3">
                        <p className="text-xs text-slate-600">Type at least 2 characters to search</p>
                    </div>
                )}

                {/* Footer hints */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-800 text-xs text-slate-600">
                    <span>↑↓ navigate</span>
                    <span>↵ open</span>
                    <span>Esc close</span>
                </div>
            </div>
        </div>
    );
}
