"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Target, Award, Zap } from "lucide-react";

interface KPICardsProps {
    stats: {
        total: number;
        live: number;
        done: number;
        pending: number;
        applied: number;
        missing: number;
        googleIssue?: number;
    };
    completionRate: number;
}

export function KPICards({ stats, completionRate }: KPICardsProps) {
    const liveAndDone = stats.live + stats.done;
    const liveRate = stats.total > 0 ? Math.round((stats.live / stats.total) * 100) : 0;
    const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
    const missingRate = stats.total > 0 ? Math.round((stats.missing / stats.total) * 100) : 0;

    const kpis = [
        {
            label: "Total Reviews",
            value: stats.total,
            sub: `${liveAndDone} completed`,
            icon: Target,
            color: "text-blue-400",
            bgColor: "bg-blue-500/20",
            borderColor: "border-blue-500/30",
            barColor: "bg-blue-500",
            barValue: 100,
            gradient: "from-blue-500/10 to-transparent",
        },
        {
            label: "Live Reviews",
            value: stats.live,
            sub: `${liveRate}% of total`,
            icon: Zap,
            color: "text-green-400",
            bgColor: "bg-green-500/20",
            borderColor: "border-green-500/30",
            barColor: "bg-green-500",
            barValue: liveRate,
            gradient: "from-green-500/10 to-transparent",
        },
        {
            label: "Done",
            value: stats.done,
            sub: `${completionRate}% completion`,
            icon: Award,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/20",
            borderColor: "border-cyan-500/30",
            barColor: "bg-cyan-500",
            barValue: completionRate,
            gradient: "from-cyan-500/10 to-transparent",
        },
        {
            label: "Pending",
            value: stats.pending,
            sub: `${pendingRate}% of total`,
            icon: Clock,
            color: "text-slate-300",
            bgColor: "bg-slate-500/20",
            borderColor: "border-slate-500/30",
            barColor: "bg-slate-400",
            barValue: pendingRate,
            gradient: "from-slate-500/10 to-transparent",
        },
        {
            label: "Applied",
            value: stats.applied,
            sub: "Waiting to go live",
            icon: TrendingUp,
            color: "text-purple-400",
            bgColor: "bg-purple-500/20",
            borderColor: "border-purple-500/30",
            barColor: "bg-purple-500",
            barValue: stats.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0,
            gradient: "from-purple-500/10 to-transparent",
        },
        {
            label: "Missing",
            value: stats.missing,
            sub: `${missingRate}% of total`,
            icon: AlertCircle,
            color: stats.missing > 0 ? "text-yellow-400" : "text-slate-500",
            bgColor: stats.missing > 0 ? "bg-yellow-500/20" : "bg-slate-500/10",
            borderColor: stats.missing > 0 ? "border-yellow-500/30" : "border-slate-700",
            barColor: "bg-yellow-500",
            barValue: missingRate,
            gradient: stats.missing > 0 ? "from-yellow-500/10 to-transparent" : "from-slate-800 to-transparent",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <Card
                        key={index}
                        className={`relative overflow-hidden bg-slate-900 border ${kpi.borderColor} hover:border-opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
                    >
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} pointer-events-none`} />

                        <CardContent className="relative p-4">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-xs text-slate-400 font-medium leading-tight">
                                    {kpi.label}
                                </p>
                                <div className={`h-8 w-8 rounded-lg ${kpi.bgColor} flex items-center justify-center shrink-0`}>
                                    <Icon className={`${kpi.color} h-4 w-4`} />
                                </div>
                            </div>

                            <p className={`text-2xl lg:text-3xl font-bold ${kpi.color} tabular-nums`}>
                                {kpi.value.toLocaleString()}
                            </p>

                            {kpi.sub && (
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                    {kpi.sub}
                                </p>
                            )}

                            {/* Progress bar */}
                            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${kpi.barColor} rounded-full transition-all duration-700`}
                                    style={{ width: `${Math.min(kpi.barValue, 100)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
