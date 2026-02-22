"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Flame, Zap, Star } from "lucide-react";

interface WorkerEntry {
    rank: number;
    medal: string | null;
    worker: { id: string; name: string; email: string; initial: string };
    stats: { liveCount: number; doneCount: number; totalUpdated: number; streak: number; score: number };
    badges: string[];
}

const avatarColors = [
    "from-indigo-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600",
];

function AnimatedNumber({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(value / 30);
        const timer = setInterval(() => {
            start += step;
            if (start >= value) { setDisplay(value); clearInterval(timer); }
            else setDisplay(start);
        }, 30);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{display.toLocaleString()}</span>;
}

export function WorkerLeaderboard() {
    const [data, setData] = useState<{ leaderboard: WorkerEntry[] } | null>(null);
    const [period, setPeriod] = useState<"week" | "month" | "all">("month");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/leaderboard?period=${period}`)
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [period]);

    if (loading) return (
        <Card className="bg-slate-900 border-slate-700/60 mb-6">
            <CardContent className="py-12 text-center text-slate-500">Loading leaderboard...</CardContent>
        </Card>
    );

    if (!data?.leaderboard?.length) return null;

    const top3 = data.leaderboard.slice(0, 3);
    const rest = data.leaderboard.slice(3);

    return (
        <Card className="bg-slate-900 border-slate-700/60 mb-6 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-400" />
                        Worker Leaderboard
                    </CardTitle>
                    <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5 text-xs">
                        {(["week", "month", "all"] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-2.5 py-1 rounded-md capitalize transition-all ${period === p ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                            >
                                {p === "all" ? "All Time" : p === "week" ? "7 Days" : "30 Days"}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
                {/* Top 3 Podium */}
                {top3.length >= 2 && (
                    <div className="flex items-end justify-center gap-3 pb-4 pt-2">
                        {/* 2nd place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center gap-2 w-24">
                                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${avatarColors[1]} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                    {top3[1].worker.initial}
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-white truncate w-20 text-center">{top3[1].worker.name}</p>
                                    <p className="text-[10px] text-slate-500">{top3[1].stats.score} pts</p>
                                </div>
                                <div className="w-full h-12 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg flex items-center justify-center">
                                    <span className="text-xl">🥈</span>
                                </div>
                            </div>
                        )}
                        {/* 1st place */}
                        {top3[0] && (
                            <div className="flex flex-col items-center gap-2 w-28">
                                <div className="relative">
                                    <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${avatarColors[0]} flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-2 ring-yellow-400/50`}>
                                        {top3[0].worker.initial}
                                    </div>
                                    <div className="absolute -top-2 -right-1 text-xl">👑</div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white truncate w-24 text-center">{top3[0].worker.name}</p>
                                    <p className="text-xs text-yellow-400 font-medium">{top3[0].stats.score} pts</p>
                                </div>
                                <div className="w-full h-20 bg-gradient-to-t from-yellow-600/40 to-yellow-500/20 border border-yellow-500/30 rounded-t-lg flex items-center justify-center">
                                    <span className="text-2xl">🥇</span>
                                </div>
                            </div>
                        )}
                        {/* 3rd place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center gap-2 w-24">
                                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${avatarColors[2]} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                    {top3[2].worker.initial}
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-white truncate w-20 text-center">{top3[2].worker.name}</p>
                                    <p className="text-[10px] text-slate-500">{top3[2].stats.score} pts</p>
                                </div>
                                <div className="w-full h-8 bg-gradient-to-t from-orange-800/40 to-orange-700/20 rounded-t-lg flex items-center justify-center">
                                    <span className="text-lg">🥉</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Full list */}
                <div className="space-y-2">
                    {data.leaderboard.map((entry, i) => {
                        const colorIndex = i % avatarColors.length;
                        return (
                            <div
                                key={entry.worker.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i === 0 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-slate-800/50 border-slate-700/40"}`}
                            >
                                {/* Rank */}
                                <div className="w-7 text-center shrink-0">
                                    {entry.medal ? (
                                        <span className="text-lg">{entry.medal}</span>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-500">#{entry.rank}</span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                                    {entry.worker.initial}
                                </div>

                                {/* Name + badges */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white">{entry.worker.name}</p>
                                    {entry.badges.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {entry.badges.map((b, bi) => (
                                                <span key={bi} className="text-[10px] text-slate-400">{b}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 shrink-0 text-xs">
                                    <div className="text-center">
                                        <p className="text-green-400 font-bold"><AnimatedNumber value={entry.stats.liveCount} /></p>
                                        <p className="text-slate-600">live</p>
                                    </div>
                                    {entry.stats.streak > 0 && (
                                        <div className="text-center">
                                            <p className="text-orange-400 font-bold flex items-center gap-0.5">
                                                <Flame size={10} />{entry.stats.streak}d
                                            </p>
                                            <p className="text-slate-600">streak</p>
                                        </div>
                                    )}
                                    <div className="text-center min-w-[40px]">
                                        <p className="text-indigo-400 font-bold text-sm"><AnimatedNumber value={entry.stats.score} /></p>
                                        <p className="text-slate-600">score</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
