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
import { DashboardHeaderActions } from "@/components/dashboard/header-actions";
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard";
import { WorkerDashboard } from "@/components/dashboard/worker-dashboard";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { OnlineUsers } from "@/components/dashboard/online-users";
import { OnlineUsersAdmin } from "@/components/admin/online-users-admin";
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
        doneReviews,
        issueReviews,
        missingReviews,
    ] = await Promise.all([
        prisma.client.count({ where: clientWhere }),
        prisma.gmbProfile.count({ where: profileWhere }),
        prisma.review.count({ where: reviewWhere }),
        prisma.review.count({ where: { ...reviewWhere, status: "PENDING" } }),
        prisma.review.count({ where: { ...reviewWhere, status: "IN_PROGRESS" } }),
        prisma.review.count({ where: { ...reviewWhere, status: "LIVE" } }),
        prisma.review.count({ where: { ...reviewWhere, status: "DONE" } }),
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
    // DATE-BASED PROGRESS (Uses real DB dueDates)
    // ============================================================================

    // Get server's start/end of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Get "Done Today" (Completed today)
    // We count anything completed today, regardless of when it was due.
    const doneTodayCount = await prisma.review.count({
        where: {
            ...reviewWhere,
            status: { in: ["DONE", "LIVE"] },
            completedAt: { gte: todayStart, lte: todayEnd },
        }
    });

    // 2. Get "Due Today or Overdue" (Pending/Issues that are due <= today)
    // This strictly respects the dueDate set by the Reschedule tool.
    // It excludes future dates (tomorrow, 11th, etc).
    const duePendingReviews = await prisma.review.findMany({
        where: {
            ...reviewWhere, // Scoped to user/admin
            status: { notIn: ["DONE", "LIVE"] }, // Only actionable items
            isArchived: false,
            dueDate: { lte: todayEnd } // <= Today (includes Overdue + Today)
        },
        include: {
            profile: {
                select: {
                    businessName: true,
                    client: { select: { name: true } }
                }
            }
        },
        orderBy: { dueDate: "asc" },
        // take: 50 // Optional limit? No, we need counts.
    });

    const pendingCount = duePendingReviews.filter(r => r.status === "PENDING").length;
    const issueCount = duePendingReviews.filter(r => ["MISSING", "GOOGLE_ISSUE"].includes(r.status)).length;

    // Total Goal = Done Today + Remaining Due <= Today
    const todayTotal = doneTodayCount + duePendingReviews.length;

    // Prepare list for "Today's Task" view (limit to 5 for UI)
    const todayReviews: ReviewWithProfile[] = duePendingReviews.slice(0, 5).map(r => ({
        id: r.id,
        status: r.status,
        dueDate: r.dueDate,
        profile: {
            businessName: r.profile.businessName || "Unknown",
            client: { name: r.profile.client?.name || "Unknown" }
        }
    }));

    return {
        totalClients,
        totalProfiles,
        totalReviews,
        pendingReviews,
        inProgressReviews,
        liveReviews,
        doneReviews,
        issueReviews,
        missingReviews,
        overdueReviews,
        todayReviews,
        isAdmin,
        todayStats: {
            total: todayTotal,
            live: doneTodayCount,
            pending: pendingCount,
            issues: issueCount
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
        <div className="p-4 lg:p-8 pt-4 lg:pt-8 h-full overflow-y-auto">
            {/* Header */}
            {/* Header Actions */}
            <div className="mt-4 lg:mt-8 flex flex-col items-start gap-4 mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Dashboard
                    <span className="block text-lg font-normal text-slate-400 mt-1">
                        Welcome back, {session?.user?.name || "User"}
                    </span>
                </h1>

                <DashboardHeaderActions />
            </div>

            {/* Enhanced Dashboard with Charts */}
            <EnhancedDashboard />

            {/* Worker Personal Dashboard */}
            {role === "WORKER" && <WorkerDashboard />}

            {/* Client Project Dashboard */}
            <ClientDashboard
                totalProfiles={data.totalProfiles}
                totalReviews={data.totalReviews}
                pendingReviews={data.pendingReviews}
                liveReviews={data.liveReviews}
                doneReviews={data.doneReviews}
                issueReviews={data.issueReviews}
                isClient={role === "CLIENT"}
            />

            {/* Online Users - Real-time for Admin, Personal for others */}
            {role === "ADMIN" ? (
                <div className="mb-8 mt-8">
                    <OnlineUsersAdmin />
                </div>
            ) : (
                <div className="mb-8 mt-8">
                    <OnlineUsers />
                </div>
            )}



        </div>
    );
}
