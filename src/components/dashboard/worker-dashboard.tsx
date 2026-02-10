"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Star,
    Calendar,
    BarChart3,
    Briefcase,
    Building2,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface WorkerStats {
    created: number;
    updated: number;
    liveCount: number;
    totalTouched: number;
    successRate: number;
    thisWeek: number;
    thisMonth: number;
    statusBreakdown: Array<{ status: string; count: number }>;
    dailyStats: Array<{ date: string; total: number }>;
    projectWiseStats?: Array<{
        clientId: string;
        clientName: string;
        reviewCount: number;
        profileCount: number;
        profiles: string[];
    }>;
}

export function WorkerDashboard() {
    const [stats, setStats] = useState<WorkerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/workers/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            const data = await res.json();
            setStats(data.stats);
            setError(null);
        } catch (err) {
            setError("Failed to load worker statistics");
            console.error("Worker stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4">
                                <div className="h-20 animate-pulse bg-slate-700 rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card className="bg-red-500/10 border-red-500/50 mb-8">
                <CardContent className="p-4">
                    <p className="text-red-400 text-sm">{error || "No stats available"}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 mb-8">
            {/* Title */}
            <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Your Performance</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Reviews Created */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Reviews Created
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.created}</div>
                        <p className="text-xs text-slate-400 mt-1">All time</p>
                    </CardContent>
                </Card>

                {/* LIVE Reviews */}
                <Card className="bg-gradient-to-br from-green-900/30 to-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            LIVE Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-400">{stats.liveCount}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats.successRate}% success rate
                        </p>
                    </CardContent>
                </Card>

                {/* This Week */}
                <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            This Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-400">{stats.thisWeek}</div>
                        <p className="text-xs text-slate-400 mt-1">Reviews touched</p>
                    </CardContent>
                </Card>

                {/* This Month */}
                <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-400">{stats.thisMonth}</div>
                        <p className="text-xs text-slate-400 mt-1">Reviews touched</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Daily Activity Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-400" />
                            Daily Activity (Last 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                    }}
                                    labelStyle={{ color: "#f1f5f9" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ fill: "#6366f1", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.statusBreakdown.map((item) => {
                                const colors: Record<string, string> = {
                                    LIVE: "bg-green-500",
                                    PENDING: "bg-slate-500",
                                    APPLIED: "bg-purple-500",
                                    MISSING: "bg-yellow-500",
                                    DONE: "bg-emerald-500",
                                    GOOGLE_ISSUE: "bg-red-500",
                                };

                                const percentage = stats.totalTouched > 0
                                    ? Math.round((item.count / stats.totalTouched) * 100)
                                    : 0;

                                return (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-300">
                                                {item.status.replace("_", " ")}
                                            </span>
                                            <span className="text-slate-400">
                                                {item.count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[item.status] || "bg-slate-500"} transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Time Period Statistics */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-400" />
                        Performance by Time Period
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Daily Average */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Daily Average</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.dailyStats.length > 0
                                            ? Math.round(
                                                  stats.dailyStats.reduce((sum, d) => sum + d.total, 0) /
                                                      stats.dailyStats.length
                                              )
                                            : 0}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 pl-12">
                                Reviews per day (last 30 days)
                            </p>
                        </div>

                        {/* This Week */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">This Week</p>
                                    <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 pl-12">
                                Reviews this week
                            </p>
                        </div>

                        {/* This Month */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">This Month</p>
                                    <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 pl-12">
                                Reviews this month
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Project-Wise Statistics */}
            {stats.projectWiseStats && stats.projectWiseStats.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-indigo-400" />
                            Projects You've Worked On
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.projectWiseStats.map((project) => (
                                <div
                                    key={project.clientId}
                                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className="h-4 w-4 text-indigo-400" />
                                                <h3 className="font-semibold text-white">
                                                    {project.clientName}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Reviews: </span>
                                                    <span className="text-white font-medium">
                                                        {project.reviewCount}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Profiles: </span>
                                                    <span className="text-white font-medium">
                                                        {project.profileCount}
                                                    </span>
                                                </div>
                                            </div>
                                            {project.profiles.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-slate-500 mb-1">
                                                        Top profiles:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.profiles.map((profile, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                                                            >
                                                                {profile}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 text-right">
                                            <div className="text-2xl font-bold text-indigo-400">
                                                {project.reviewCount}
                                            </div>
                                            <div className="text-xs text-slate-500">reviews</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
