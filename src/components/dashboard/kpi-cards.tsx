"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Target, Award } from "lucide-react";

interface KPICardsProps {
    stats: {
        total: number;
        live: number;
        done: number;
        pending: number;
        applied: number;
        missing: number;
    };
    completionRate: number;
}

export function KPICards({ stats, completionRate }: KPICardsProps) {
    const kpis = [
        {
            label: "Total Reviews",
            value: stats.total,
            icon: Target,
            color: "text-blue-400",
            bgColor: "bg-blue-500/20",
            trend: null,
        },
        {
            label: "Live Reviews",
            value: stats.live,
            icon: CheckCircle2,
            color: "text-green-400",
            bgColor: "bg-green-500/20",
            trend: `${completionRate}% completion`,
        },
        {
            label: "Done Reviews",
            value: stats.done,
            icon: Award,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/20",
            trend: null,
        },
        {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-slate-400",
            bgColor: "bg-slate-500/20",
            trend: null,
        },
        {
            label: "Applied",
            value: stats.applied,
            icon: TrendingUp,
            color: "text-purple-400",
            bgColor: "bg-purple-500/20",
            trend: null,
        },
        {
            label: "Missing",
            value: stats.missing,
            icon: AlertCircle,
            color: "text-yellow-400",
            bgColor: "bg-yellow-500/20",
            trend: null,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <Card
                        key={index}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-slate-400 font-medium">
                                    {kpi.label}
                                </p>
                                <div
                                    className={`h-10 w-10 rounded-full ${kpi.bgColor} flex items-center justify-center`}
                                >
                                    <Icon className={`${kpi.color} h-5 w-5`} />
                                </div>
                            </div>
                            <div>
                                <p className={`text-3xl font-bold ${kpi.color}`}>
                                    {kpi.value.toLocaleString()}
                                </p>
                                {kpi.trend && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {kpi.trend}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
