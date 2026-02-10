"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, ChevronDown } from "lucide-react";

interface ActivityFeedProps {
    activities: Array<{
        id: string;
        status: string;
        updatedAt: string;
        profile: {
            businessName: string;
        };
        updatedBy?: {
            name: string | null;
        } | null;
    }>;
}

const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
> = {
    LIVE: { label: "Live", color: "bg-green-500", icon: CheckCircle2 },
    PENDING: { label: "Pending", color: "bg-slate-500", icon: Clock },
    APPLIED: { label: "Applied", color: "bg-purple-500", icon: TrendingUp },
    MISSING: { label: "Missing", color: "bg-yellow-500", icon: AlertCircle },
    DONE: { label: "Done", color: "bg-emerald-500", icon: CheckCircle2 },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const [showAll, setShowAll] = useState(false);
    const displayedActivities = showAll ? activities : activities.slice(0, 10);
    const hasMore = activities.length > 10;

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <span className="text-xs text-slate-400">
                    {showAll ? activities.length : Math.min(10, activities.length)} of {activities.length}
                </span>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">
                            No recent activity
                        </p>
                    ) : (
                        <>
                            {displayedActivities.map((activity) => {
                            const config = statusConfig[activity.status] || statusConfig.PENDING;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                                >
                                    <div
                                        className={`${config.color} p-2 rounded-full bg-opacity-20`}
                                    >
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">
                                            {activity.profile.businessName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                className={`${config.color} text-white text-xs`}
                                            >
                                                {config.label}
                                            </Badge>
                                            {activity.updatedBy?.name && (
                                                <span className="text-xs text-slate-400">
                                                    by {activity.updatedBy.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatDistanceToNow(new Date(activity.updatedAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {hasMore && !showAll && (
                            <Button
                                variant="ghost"
                                className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/50"
                                onClick={() => setShowAll(true)}
                            >
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Load More ({activities.length - 10} more)
                            </Button>
                        )}

                        {showAll && hasMore && (
                            <Button
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                                onClick={() => setShowAll(false)}
                            >
                                Show Less
                            </Button>
                        )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
