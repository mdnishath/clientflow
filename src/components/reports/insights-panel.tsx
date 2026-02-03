"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    Trophy,
    AlertTriangle,
    Clock,
    TrendingUp,
    User,
    Star,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

interface ClientPerformance {
    id: string;
    name: string;
    total: number;
    live: number;
    successRate: number;
}

interface ProblemReview {
    id: string;
    businessName: string;
    status: string;
    daysSinceCreated: number;
}

interface RecentActivity {
    id: string;
    businessName: string;
    action: string;
    status: string;
    timestamp: string;
}

interface PeriodComparison {
    currentPeriod: number;
    previousPeriod: number;
    change: number;
    changePercent: number;
}

interface InsightsPanelProps {
    bestClient: ClientPerformance | null;
    problemReviews: ProblemReview[];
    recentActivity: RecentActivity[];
    weekComparison: PeriodComparison;
}

const statusColors: Record<string, string> = {
    PENDING: "bg-slate-500",
    IN_PROGRESS: "bg-blue-500",
    MISSING: "bg-yellow-500",
    APPLIED: "bg-purple-500",
    GOOGLE_ISSUE: "bg-red-500",
    LIVE: "bg-green-500",
    DONE: "bg-emerald-500",
};

export function InsightsPanel({
    bestClient,
    problemReviews,
    recentActivity,
    weekComparison,
}: InsightsPanelProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Best Performing Client */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                        <Trophy size={16} />
                        Best Client
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bestClient ? (
                        <Link href={`/clients/${bestClient.id}`} className="block group">
                            <p className="text-lg font-bold text-white truncate group-hover:text-yellow-300 transition-colors">
                                {bestClient.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl font-bold text-yellow-400">
                                    {bestClient.successRate}%
                                </span>
                                <span className="text-xs text-slate-400">success rate</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {bestClient.live} live of {bestClient.total} total
                            </p>
                        </Link>
                    ) : (
                        <p className="text-slate-500 text-sm">No data yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Week over Week */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <TrendingUp size={16} />
                        This Week
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                            {weekComparison.currentPeriod}
                        </span>
                        {weekComparison.change !== 0 && (
                            <div
                                className={`flex items-center gap-1 text-sm ${weekComparison.change > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {weekComparison.change > 0 ? (
                                    <ArrowUpRight size={16} />
                                ) : (
                                    <ArrowDownRight size={16} />
                                )}
                                <span>{Math.abs(weekComparison.changePercent)}%</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        vs {weekComparison.previousPeriod} last week
                    </p>
                </CardContent>
            </Card>

            {/* Problem Reviews */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-400 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Needs Attention
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {problemReviews.length > 0 ? (
                        <div className="space-y-2">
                            {problemReviews.slice(0, 3).map((review) => (
                                <Link
                                    key={review.id}
                                    href={`/reviews?id=${review.id}`}
                                    className="flex items-center justify-between hover:bg-slate-700/30 p-1 -m-1 rounded transition-colors group"
                                >
                                    <span className="text-sm text-slate-300 truncate max-w-[120px] group-hover:text-white transition-colors">
                                        {review.businessName}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs text-orange-400 border-orange-400/50"
                                    >
                                        {review.daysSinceCreated}d
                                    </Badge>
                                </Link>
                            ))}
                            {problemReviews.length > 3 && (
                                <p className="text-xs text-slate-500">
                                    +{problemReviews.length - 3} more
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-green-400 text-sm flex items-center gap-2">
                            <Star size={14} />
                            All reviews on track!
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Clock size={16} />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-2">
                            {recentActivity.slice(0, 3).map((activity) => (
                                <Link
                                    key={activity.id}
                                    href={`/reviews?id=${activity.id}`}
                                    className="flex items-center gap-2 hover:bg-slate-700/30 p-1 -m-1 rounded transition-colors group"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${statusColors[activity.status] || "bg-slate-500"
                                            }`}
                                    />
                                    <span className="text-xs text-slate-300 truncate flex-1 group-hover:text-white transition-colors">
                                        {activity.businessName}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {formatDistanceToNow(new Date(activity.timestamp), {
                                            addSuffix: false,
                                        })}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No recent activity</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
