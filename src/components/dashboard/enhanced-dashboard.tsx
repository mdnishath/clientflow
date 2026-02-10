"use client";

import { useEffect, useState } from "react";
import { KPICards } from "./kpi-cards";
import { DashboardCharts } from "./dashboard-charts";
import { ActivityFeed } from "./activity-feed";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { AlertCircle } from "lucide-react";

interface DashboardStats {
    stats: {
        total: number;
        live: number;
        pending: number;
        applied: number;
        missing: number;
        done: number;
        googleIssue: number;
    };
    completionRate: number;
    dailyData: Array<{
        date: string;
        live: number;
        pending: number;
        applied: number;
        missing: number;
    }>;
    recentActivity: Array<{
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

export function EnhancedDashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("/api/stats/dashboard");
            if (!response.ok) throw new Error("Failed to fetch dashboard data");

            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <Card className="bg-red-500/10 border-red-500/50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <KPICards stats={data.stats} completionRate={data.completionRate} />

            {/* Charts */}
            <DashboardCharts dailyData={data.dailyData} stats={data.stats} />

            {/* Activity Feed */}
            <ActivityFeed activities={data.recentActivity} />
        </div>
    );
}
