import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Users,
    Star,
    ListTodo,
    Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoFillButton } from "@/components/dashboard/auto-fill-button";
import { DeletePendingButton } from "@/components/dashboard/delete-pending-button";
import Link from "next/link";

interface ReviewWithProfile {
    id: string;
    status: string;
    dueDate: Date | null;
    profile: {
        businessName: string;
        client: { name: string };
    };
}

// Get dashboard data based on user role and scope
// Get dashboard data based on user role and scope
async function getDashboardData(userId: string, role: string, clientId: string | null, parentAdminId?: string | null) {
    const isAdmin = role === "ADMIN";
    const isWorker = role === "WORKER";

    // Determine the effective User ID for scoping (Admin ID or Worker's Parent Admin ID)
    const effectiveAdminId = isAdmin ? userId : (isWorker && parentAdminId ? parentAdminId : null);

    // Build where clause based on role
    // Admin or Worker: Show data scoped to the Admin ID
    // Client: Show data scoped to their clientId
    const reviewWhere = effectiveAdminId
        ? { isArchived: false, profile: { client: { userId: effectiveAdminId } } }
        : clientId
            ? { profile: { clientId }, isArchived: false }
            : { id: "__no_data__", isArchived: false };

    const profileWhere = effectiveAdminId
        ? { isArchived: false, client: { userId: effectiveAdminId } }
        : clientId
            ? { clientId, isArchived: false }
            : { id: "__no_data__", isArchived: false };

    const clientWhere = effectiveAdminId
        ? { isArchived: false, userId: effectiveAdminId }
        : clientId
            ? { id: clientId, isArchived: false }
            : { id: "__no_data__", isArchived: false };

    const [
        totalClients,
        totalProfiles,
        totalReviews,
        pendingReviews,
        inProgressReviews,
        liveReviews,
        issueReviews,
        missingReviews,
    ] = await Promise.all([
        prisma.client.count({ where: clientWhere }),
        prisma.gmbProfile.count({ where: profileWhere }),
        prisma.review.count({ where: reviewWhere }),
        prisma.review.count({ where: { ...reviewWhere, status: "PENDING" } }),
        prisma.review.count({ where: { ...reviewWhere, status: "IN_PROGRESS" } }),
        prisma.review.count({ where: { ...reviewWhere, status: "LIVE" } }),
        prisma.review.count({
            where: {
                ...reviewWhere,
                status: { in: ["MISSING", "GOOGLE_ISSUE"] },
            },
        }),
        prisma.review.count({ where: { ...reviewWhere, checkStatus: "MISSING" } }),
    ]);

    // Get overdue reviews
    const overdueWhere = effectiveAdminId
        ? {
            dueDate: { lt: new Date() },
            status: { notIn: ["DONE", "LIVE"] },
            isArchived: false,
            profile: { client: { userId: effectiveAdminId } },
        }
        : clientId
            ? {
                profile: { clientId },
                dueDate: { lt: new Date() },
                status: { notIn: ["DONE", "LIVE"] },
                isArchived: false,
            }
            : { id: "__no_data__" };

    const overdueReviews = await prisma.review.findMany({
        where: overdueWhere as any,
        include: {
            profile: { select: { businessName: true, client: { select: { name: true } } } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
    });


    // ============================================================================
    // SCHEDULING-BASED PROGRESS (NOT dueDate-based)
    // ============================================================================
    // Match the logic from /api/me/stats to ensure consistency

    // Get server's start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch ALL reviews (no dueDate filter)
    const allReviews = await prisma.review.findMany({
        where: reviewWhere as any,
        include: {
            profile: {
                select: {
                    id: true,
                    reviewLimit: true,
                    reviewsStartDate: true,
                    businessName: true, // Added for todayReviews list
                    client: { select: { name: true } } // Added for todayReviews list
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // 2. Get "Done Today" counts per profile
    const profileIds = [...new Set(allReviews.map(r => r.profileId))];
    const doneCounts = await prisma.review.groupBy({
        by: ["profileId"],
        where: {
            profileId: { in: profileIds },
            status: { in: ["DONE", "LIVE"] },
            completedAt: { gte: today },
            isArchived: false,
        },
        _count: { id: true },
    });

    const doneTodayMap: Record<string, number> = {};
    doneCounts.forEach(c => {
        doneTodayMap[c.profileId] = c._count.id;
    });

    // 3. Apply scheduling logic
    const reviewsByProfile: Record<string, typeof allReviews> = {};
    for (const r of allReviews) {
        if (!reviewsByProfile[r.profileId]) {
            reviewsByProfile[r.profileId] = [];
        }
        reviewsByProfile[r.profileId].push(r);
    }

    let todayTotal = 0;
    let todayLive = 0;
    let todayPending = 0;
    let todayIssues = 0;
    const todayReviews: ReviewWithProfile[] = [];

    for (const profileId in reviewsByProfile) {
        const profileReviews = reviewsByProfile[profileId];

        // Sort by creation
        profileReviews.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeA === timeB ? (a.id < b.id ? -1 : 1) : timeA - timeB;
        });

        const { reviewLimit, reviewsStartDate } = profileReviews[0].profile;

        if (reviewLimit && reviewsStartDate) {
            const doneTodayCount = doneTodayMap[profileId] || 0;
            const remainingQuota = Math.max(0, reviewLimit - doneTodayCount);

            let quotaUsed = 0;

            for (const review of profileReviews) {
                const isPendingType = review.status !== "DONE" && review.status !== "LIVE" && !review.isArchived;

                if (isPendingType) {
                    if (quotaUsed < remainingQuota) {
                        // This review is DUE TODAY (within quota)
                        todayTotal++;
                        if (review.status === "PENDING") {
                            todayPending++;
                            if (todayReviews.length < 5) {
                                todayReviews.push({
                                    id: review.id,
                                    status: review.status,
                                    dueDate: review.dueDate,
                                    profile: {
                                        businessName: (review.profile as any).businessName || "Unknown",
                                        client: { name: (review.profile as any).client?.name || "Unknown" }
                                    }
                                });
                            }
                        }
                        if (review.status === "MISSING" || review.status === "GOOGLE_ISSUE") {
                            todayIssues++;
                        }
                        quotaUsed++;
                    }
                    // else: scheduled for future, don't count
                } else if (review.status === "LIVE" || review.status === "DONE") {
                    // Count completed reviews (they were part of initial pending + now live)
                    if (review.completedAt && new Date(review.completedAt) >= today) {
                        todayLive++;
                        todayTotal++;
                    }
                }
            }
        }
    }

    return {
        totalClients,
        totalProfiles,
        totalReviews,
        pendingReviews,
        inProgressReviews,
        liveReviews,
        issueReviews,
        missingReviews,
        overdueReviews,
        todayReviews,
        isAdmin,
        todayStats: {
            total: todayTotal,
            live: todayLive,
            pending: todayPending,
            issues: todayIssues
        }
    };
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

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const { role, clientId, parentAdminId } = session.user;
    const data = await getDashboardData(session.user.id, role, clientId, parentAdminId);

    // If total is 0, we consider it 100% done (nothing pending)
    const dailyProgress = data.todayStats.total > 0
        ? Math.round((data.todayStats.live / data.todayStats.total) * 100)
        : 100;

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">
                        Welcome back, {session.user.name || "there"}
                    </p>
                </div>
                {data.isAdmin && (
                    <div className="flex gap-3">
                        <DeletePendingButton />
                        <AutoFillButton />
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                {/* 1. Daily Progress Card (Prominent) */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 md:col-span-1 lg:col-span-1 border-l-4 border-l-indigo-500 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                            <span>Today's Goal</span>
                            <span className="text-xs font-normal bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end justify-between mb-4">
                            <div className="space-y-1">
                                <span className="text-3xl font-bold text-white block">
                                    {dailyProgress}%
                                </span>
                                <span className="text-xs text-slate-400">
                                    Completion Rate
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-green-400 flex items-center justify-end gap-1">
                                    <CheckCircle2 size={14} />
                                    {data.todayStats.live} Done
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {data.todayStats.pending} Pending
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${dailyProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-center text-slate-500">
                                {data.todayStats.live} of {data.todayStats.total} reviews live today
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">Total Reviews</p>
                            <Star className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {data.totalReviews}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">All time</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">Pending</p>
                            <Clock className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {data.pendingReviews}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">Live</p>
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-400">
                                {data.liveReviews}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Effectively posted</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Clients/Profiles small cards */}
                {data.isAdmin ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Clients</p>
                                    <p className="text-xl font-bold text-white">
                                        {data.totalClients}
                                    </p>
                                </div>
                                <Users className="h-5 w-5 text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Profiles</p>
                                    <p className="text-xl font-bold text-white">
                                        {data.totalProfiles}
                                    </p>
                                </div>
                                <Store className="h-5 w-5 text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">In Progress</p>
                                <p className="text-xl font-bold text-blue-400">
                                    {data.inProgressReviews}
                                </p>
                            </div>
                            <ListTodo className="h-5 w-5 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Issues</p>
                                <p className="text-xl font-bold text-red-400">
                                    {data.issueReviews}
                                </p>
                            </div>
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Link href="/checker?checkStatus=MISSING">
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-400">Missing</p>
                                    <p className="text-xl font-bold text-yellow-400">
                                        {data.missingReviews}
                                    </p>
                                </div>
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Alerts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Overdue Reviews */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                            <AlertCircle size={16} className="mr-2 text-red-400" />
                            Overdue Reviews
                            {data.overdueReviews.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {data.overdueReviews.length}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.overdueReviews.length === 0 ? (
                            <p className="text-sm text-slate-500">No overdue reviews 🎉</p>
                        ) : (
                            <ul className="space-y-2">
                                {(data.overdueReviews as ReviewWithProfile[]).map((review) => (
                                    <li
                                        key={review.id}
                                        className="text-sm flex items-center justify-between"
                                    >
                                        <div className="flex flex-col truncate mr-2">
                                            <span className="text-slate-300 font-medium truncate">
                                                {review.profile.businessName}
                                            </span>
                                            <span className="text-slate-500 text-xs truncate">
                                                {review.profile.client.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[review.status]} text-white shrink-0`}>
                                            {review.status.replace("_", " ")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Reviews */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
                            <Clock size={16} className="mr-2 text-blue-400" />
                            Due Today
                            {data.todayReviews.length > 0 && (
                                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {data.todayReviews.length}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.todayReviews.length === 0 ? (
                            <p className="text-sm text-slate-500">No reviews due today</p>
                        ) : (
                            <ul className="space-y-2">
                                {(data.todayReviews as ReviewWithProfile[]).map((review) => (
                                    <li
                                        key={review.id}
                                        className="text-sm flex items-center justify-between"
                                    >
                                        <div className="flex flex-col truncate mr-2">
                                            <span className="text-slate-300 font-medium truncate">
                                                {review.profile.businessName}
                                            </span>
                                            <span className="text-slate-500 text-xs truncate">
                                                {review.profile.client.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[review.status]} text-white shrink-0`}>
                                            {review.status.replace("_", " ")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
