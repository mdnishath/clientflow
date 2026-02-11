import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { ActivityHeatMap } from "@/components/dashboard/activity-heat-map";
import { InsightsPanel } from "@/components/reports/insights-panel";
import { ExportReportButton } from "@/components/reports/export-report-button";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { ProfileProgressReport } from "@/components/reports/profile-progress-report";
import { format, subDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import Link from "next/link";
import {
    Star,
    CheckCircle2,
    TrendingUp,
    Users,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    FileText,
} from "lucide-react";

interface AnalyticsFilters {
    startDate: Date;
    endDate: Date;
    clientId?: string;
    category?: string;
    status?: string;
    clientIdScope?: string | null; // For multi-tenant scope filtering
}

async function getAnalyticsData(userId: string, filters: AnalyticsFilters) {
    const { startDate, endDate, clientId, category, status, clientIdScope } = filters;
    const effectiveEndDate = endOfDay(endDate);
    const effectiveStartDate = startOfDay(startDate);

    // Main reviews query with filters - using scope-based filtering
    const whereClause: any = {
        isArchived: false,
        createdAt: {
            gte: effectiveStartDate,
            lte: effectiveEndDate,
        },
    };

    // Apply scope-based filtering
    // For ADMIN: filter by userId (all reviews owned by user)
    // For CLIENT: filter by profile.clientId
    if (clientIdScope) {
        // Client scope - filter by their linked client
        whereClause.profile = { clientId: clientIdScope };
    } else {
        // Admin scope - filter by userId
        whereClause.userId = userId;
    }

    // Add status filter if provided
    if (status && status !== "all") {
        whereClause.status = status;
    }

    // Add nested profile filters if provided
    if ((clientId && clientId !== "all") || (category && category !== "all")) {
        whereClause.profile = whereClause.profile || {};
        if (clientId && clientId !== "all") {
            // Only apply clientId filter if no scope is set (Admin), or if it matches scope
            if (!clientIdScope || clientId === clientIdScope) {
                whereClause.profile.clientId = clientId;
            }
        }
        if (category && category !== "all") {
            whereClause.profile.category = category;
        }
    }

    const reviews = await prisma.review.findMany({
        where: whereClause,
        select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            profile: {
                select: {
                    id: true,
                    businessName: true,
                    category: true,
                    client: { select: { id: true, name: true } }
                }
            }
        },
        orderBy: { createdAt: "asc" },
    });

    // Daily/Monthly Trends
    const trendsMap = new Map<string, number>();
    const diffDays = differenceInDays(endDate, startDate);
    const dateFormat = diffDays > 60 ? "MMM yyyy" : "MMM dd";

    reviews.forEach(r => {
        const key = format(r.createdAt, dateFormat);
        trendsMap.set(key, (trendsMap.get(key) || 0) + 1);
    });

    const monthlyData = Array.from(trendsMap.entries()).map(([name, total]) => ({ name, total }));

    // Sparkline data (last 7 days)
    const sparklineData: number[] = [];
    const dailyMap = new Map<string, number>();

    // Fetch all reviews for heatmap (last 90 days) - scope-based
    const heatmapWhereClause = clientIdScope
        ? { profile: { clientId: clientIdScope } }
        : { userId };

    const allReviewsForHeatmap = await prisma.review.findMany({
        where: {
            ...heatmapWhereClause,
            isArchived: false,
            createdAt: {
                gte: subDays(new Date(), 90),
                lte: new Date(),
            },
        },
        select: { createdAt: true },
    });

    allReviewsForHeatmap.forEach(r => {
        const key = format(r.createdAt, "yyyy-MM-dd");
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    });

    // Build sparkline for last 7 days
    for (let i = 6; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "yyyy-MM-dd");
        sparklineData.push(dailyMap.get(day) || 0);
    }

    // Heatmap data
    const heatmapData: { date: string; count: number }[] = [];
    dailyMap.forEach((count, date) => {
        heatmapData.push({ date, count });
    });

    // Status Distribution
    const statusCounts: Record<string, number> = {};
    reviews.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const statusData = [
        { name: "Pending", value: statusCounts["PENDING"] || 0, color: "#64748b" },
        { name: "In Progress", value: statusCounts["IN_PROGRESS"] || 0, color: "#3b82f6" },
        { name: "Applied", value: statusCounts["APPLIED"] || 0, color: "#a855f7" },
        { name: "Missing", value: statusCounts["MISSING"] || 0, color: "#eab308" },
        { name: "Google Issue", value: statusCounts["GOOGLE_ISSUE"] || 0, color: "#ef4444" },
        { name: "Live", value: statusCounts["LIVE"] || 0, color: "#22c55e" },
        { name: "Done", value: statusCounts["DONE"] || 0, color: "#10b981" },
    ].filter(i => i.value > 0);

    // KPI Metrics
    const totalReviews = reviews.length;
    const liveReviews = (statusCounts["LIVE"] || 0) + (statusCounts["DONE"] || 0);
    const pendingReviews = statusCounts["PENDING"] || 0;
    const inProgressReviews = statusCounts["IN_PROGRESS"] || 0;
    const successRate = totalReviews > 0 ? Math.round((liveReviews / totalReviews) * 100) : 0;

    // Average Completion Time (for LIVE/DONE reviews)
    const completedReviews = reviews.filter(r => r.status === "LIVE" || r.status === "DONE");
    let avgCompletionDays = 0;
    if (completedReviews.length > 0) {
        const totalDays = completedReviews.reduce((sum, r) => {
            return sum + differenceInDays(r.updatedAt, r.createdAt);
        }, 0);
        avgCompletionDays = Math.round(totalDays / completedReviews.length);
    }

    // Week over Week Comparison - scope-based
    const thisWeekStart = subDays(new Date(), 7);
    const lastWeekStart = subDays(new Date(), 14);
    const lastWeekEnd = subDays(new Date(), 7);

    // Build week comparison where clause based on scope
    const weekWhereBase = clientIdScope
        ? { profile: { clientId: clientIdScope } }
        : { userId };

    const [thisWeekReviews, lastWeekReviews] = await Promise.all([
        prisma.review.count({
            where: {
                ...weekWhereBase,
                isArchived: false,
                createdAt: { gte: thisWeekStart, lte: new Date() },
            },
        }),
        prisma.review.count({
            where: {
                ...weekWhereBase,
                isArchived: false,
                createdAt: { gte: lastWeekStart, lte: lastWeekEnd },
            },
        }),
    ]);

    const weekChange = thisWeekReviews - lastWeekReviews;
    const weekChangePercent = lastWeekReviews > 0
        ? Math.round((weekChange / lastWeekReviews) * 100)
        : thisWeekReviews > 0 ? 100 : 0;

    // Client Performance
    const clientCounts: Record<string, { id: string, name: string, count: number, live: number }> = {};
    reviews.forEach(r => {
        const cId = r.profile.client.id;
        const cName = r.profile.client.name;
        if (!clientCounts[cId]) clientCounts[cId] = { id: cId, name: cName, count: 0, live: 0 };
        clientCounts[cId].count++;
        if (r.status === "LIVE" || r.status === "DONE") {
            clientCounts[cId].live++;
        }
    });

    const topClients = Object.values(clientCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Best Performing Client (min 3 reviews, highest success rate)
    const clientsWithRate = Object.entries(clientCounts)
        .map(([id, data]) => ({
            id,
            name: data.name,
            total: data.count,
            live: data.live,
            successRate: data.count > 0 ? Math.round((data.live / data.count) * 100) : 0,
        }))
        .filter(c => c.total >= 2)
        .sort((a, b) => b.successRate - a.successRate);

    const bestClient = clientsWithRate[0] || null;

    // Problem Reviews (stuck in MISSING/GOOGLE_ISSUE)
    const problemReviews = reviews
        .filter(r => r.status === "MISSING" || r.status === "GOOGLE_ISSUE")
        .map(r => ({
            id: r.id,
            businessName: r.profile.businessName,
            status: r.status,
            daysSinceCreated: differenceInDays(new Date(), r.createdAt),
        }))
        .sort((a, b) => b.daysSinceCreated - a.daysSinceCreated)
        .slice(0, 5);

    // Recent Activity (last 10 updated) - scope-based
    const recentWhereClause = clientIdScope
        ? { profile: { clientId: clientIdScope } }
        : { userId };

    const recentReviews = await prisma.review.findMany({
        where: { ...recentWhereClause, isArchived: false },
        select: {
            id: true,
            status: true,
            updatedAt: true,
            profile: { select: { businessName: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
    });

    const recentActivity = recentReviews.map(r => ({
        id: r.id,
        businessName: r.profile.businessName,
        action: "Status changed",
        status: r.status,
        timestamp: r.updatedAt.toISOString(),
    }));

    return {
        monthlyData,
        statusData,
        heatmapData,
        sparklineData,
        metrics: {
            totalReviews,
            liveReviews,
            pendingReviews,
            inProgressReviews,
            successRate,
            avgCompletionDays,
        },
        topClients,
        bestClient,
        problemReviews,
        recentActivity,
        weekComparison: {
            currentPeriod: thisWeekReviews,
            previousPeriod: lastWeekReviews,
            change: weekChange,
            changePercent: weekChangePercent,
        },
    };
}

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Get scope for multi-tenant RBAC
    const scope = await getClientScope();
    const clientIdScope = scope && !scope.isAdmin ? scope.clientId : null;

    // Await searchParams to get the plain object
    const resolvedSearchParams = await searchParams;

    // Parse filter parameters
    const startDate = resolvedSearchParams.from
        ? new Date(resolvedSearchParams.from as string)
        : subDays(new Date(), 30);
    const endDate = resolvedSearchParams.to
        ? new Date(resolvedSearchParams.to as string)
        : new Date();
    const clientId = resolvedSearchParams.clientId as string | undefined;
    const category = resolvedSearchParams.category as string | undefined;
    const status = resolvedSearchParams.status as string | undefined;

    // Fetch clients and categories for filters (scope-based)
    const clientWhereClause = clientIdScope
        ? { id: clientIdScope }
        : { userId: session.user.id };

    const profileWhereClause = clientIdScope
        ? { clientId: clientIdScope }
        : { client: { userId: session.user.id } };

    const [clients, categories] = await Promise.all([
        prisma.client.findMany({
            where: clientWhereClause,
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        }),
        prisma.gmbProfile.findMany({
            select: { category: true },
            distinct: ["category"],
            where: profileWhereClause,
        }).then(profiles => profiles.map(p => p.category).filter(Boolean) as string[]),
    ]);

    const data = await getAnalyticsData(session.user.id, {
        startDate,
        endDate,
        clientId,
        category,
        status,
        clientIdScope,
    });

    // Prepare filter object for export
    const filterParams = {
        from: resolvedSearchParams.from as string | undefined,
        to: resolvedSearchParams.to as string | undefined,
        clientId: resolvedSearchParams.clientId as string | undefined,
        category: resolvedSearchParams.category as string | undefined,
        status: resolvedSearchParams.status as string | undefined,
    };

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header with Export Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-indigo-400" size={28} />
                        Reports & Analytics
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Track your review performance and insights
                    </p>
                </div>
                <ExportReportButton filters={filterParams} />
            </div>

            {/* Filters */}
            <ReportsFilters clients={clients} categories={categories} />

            {/* Profile Progress Report Section */}
            <div className="mb-8">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-white">Profile Progress Report</CardTitle>
                                <p className="text-sm text-slate-400 mt-1">Track completion status across all profiles</p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href="/api/reports/profile-progress/export?format=pdf"
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <FileText size={16} />
                                    Export PDF
                                </a>
                                <a
                                    href="/api/reports/profile-progress/export?format=excel"
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <FileText size={16} />
                                    Export Excel
                                </a>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ProfileProgressReport />
                    </CardContent>
                </Card>
            </div>

            {/* Insights Panel (Best Client, This Week, Problem Reviews, Recent Activity) */}
            <div className="mb-8">
                <InsightsPanel
                    bestClient={data.bestClient}
                    problemReviews={data.problemReviews}
                    recentActivity={data.recentActivity}
                    weekComparison={data.weekComparison}
                />
            </div>

            {/* KPI Cards with AnimatedCounter and Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {/* Total Reviews */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Reviews</p>
                                <h3 className="text-2xl font-bold text-white mt-1">
                                    <AnimatedCounter value={data.metrics.totalReviews} />
                                </h3>
                            </div>
                            <Star className="text-indigo-400" size={20} />
                        </div>
                        <div className="mt-3">
                            <Sparkline data={data.sparklineData} width={100} height={24} color="#6366f1" />
                        </div>
                    </CardContent>
                </Card>

                {/* Success Rate */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Success Rate</p>
                                <h3 className="text-2xl font-bold text-green-400 mt-1">
                                    <AnimatedCounter value={data.metrics.successRate} suffix="%" />
                                </h3>
                            </div>
                            <TrendingUp className="text-green-400" size={20} />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">{data.metrics.liveReviews} live reviews</p>
                    </CardContent>
                </Card>

                {/* Live Reviews with Week Comparison */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Reviews</p>
                                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                                    <AnimatedCounter value={data.metrics.liveReviews} />
                                </h3>
                            </div>
                            <CheckCircle2 className="text-emerald-400" size={20} />
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                            {data.weekComparison.change > 0 ? (
                                <ArrowUpRight className="text-green-400" size={14} />
                            ) : data.weekComparison.change < 0 ? (
                                <ArrowDownRight className="text-red-400" size={14} />
                            ) : null}
                            <span className={`text-xs ${data.weekComparison.change > 0 ? "text-green-400" : data.weekComparison.change < 0 ? "text-red-400" : "text-slate-500"}`}>
                                {data.weekComparison.change > 0 ? "+" : ""}{data.weekComparison.change} this week
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
                                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                                    <AnimatedCounter value={data.metrics.pendingReviews} />
                                </h3>
                            </div>
                            <Clock className="text-amber-400" size={20} />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            {data.metrics.inProgressReviews} in progress
                        </p>
                    </CardContent>
                </Card>

                {/* Average Completion Time */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg. Completion</p>
                                <h3 className="text-2xl font-bold text-cyan-400 mt-1">
                                    <AnimatedCounter value={data.metrics.avgCompletionDays} suffix=" days" />
                                </h3>
                            </div>
                            <FileText className="text-cyan-400" size={20} />
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Time to go live</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Review Growth Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-white">Review Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {data.monthlyData.length > 0 ? (
                            <OverviewChart data={data.monthlyData} />
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                                <FileText size={48} className="mb-3 opacity-30" />
                                <p>No review data for this period</p>
                                <p className="text-xs mt-1">Start adding reviews to see growth trends</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Distribution Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-white">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.statusData.length > 0 ? (
                            <StatusChart data={data.statusData} />
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                                <AlertCircle size={48} className="mb-3 opacity-30" />
                                <p>No status data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Heatmap */}
            <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        Activity Overview
                        <span className="text-xs font-normal text-slate-500">Last 12 weeks</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.heatmapData.length > 0 ? (
                        <ActivityHeatMap data={data.heatmapData} weeks={12} />
                    ) : (
                        <div className="h-[120px] flex items-center justify-center text-slate-500">
                            <p>No activity data yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Clients Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <Users size={20} className="text-slate-400" />
                        Top Performing Clients
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.topClients.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                            <Users size={48} className="mb-3 opacity-30" />
                            <p>No client data found</p>
                            <p className="text-xs mt-1">Add reviews with client assignments to see rankings</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.topClients.map((client, i) => {
                                const rate = client.count > 0 ? Math.round((client.live / client.count) * 100) : 0;
                                return (
                                    <Link
                                        key={client.name}
                                        href={`/clients/${client.id}`}
                                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-700"}`}>
                                                {i + 1}
                                            </div>
                                            <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{client.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-white">{client.count}</span>
                                                <span className="text-xs text-slate-500 ml-1">total</span>
                                            </div>
                                            <div className="w-14 text-right">
                                                <span className={`text-sm font-medium ${rate >= 70 ? "text-green-400" : rate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                                                    {rate}%
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
