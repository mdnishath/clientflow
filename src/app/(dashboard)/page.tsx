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
async function getDashboardData(userId: string, role: string, clientId: string | null) {
    const isAdmin = role === "ADMIN";

    // Build where clause based on role
    // For clients without linked clientId, show nothing
    const reviewWhere = isAdmin
        ? { isArchived: false }
        : clientId
            ? { profile: { clientId }, isArchived: false }
            : { id: "__no_data__", isArchived: false }; // No data if no clientId

    const profileWhere = isAdmin
        ? { isArchived: false }
        : clientId
            ? { clientId, isArchived: false }
            : { id: "__no_data__", isArchived: false };

    const clientWhere = isAdmin
        ? { isArchived: false }
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
    ]);

    // Get overdue reviews
    const overdueWhere = isAdmin
        ? {
            dueDate: { lt: new Date() },
            status: { notIn: ["DONE", "LIVE"] },
            isArchived: false,
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

    // Get today's reviews
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWhere = isAdmin
        ? {
            dueDate: { gte: today, lt: tomorrow },
            status: { notIn: ["DONE", "LIVE"] },
            isArchived: false,
        }
        : clientId
            ? {
                profile: { clientId },
                dueDate: { gte: today, lt: tomorrow },
                status: { notIn: ["DONE", "LIVE"] },
                isArchived: false,
            }
            : { id: "__no_data__" };

    const todayReviews = await prisma.review.findMany({
        where: todayWhere as any,
        include: {
            profile: { select: { businessName: true, client: { select: { name: true } } } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
    });

    return {
        totalClients,
        totalProfiles,
        totalReviews,
        pendingReviews,
        inProgressReviews,
        liveReviews,
        issueReviews,
        overdueReviews,
        todayReviews,
        isAdmin,
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

    const { role, clientId } = session.user;
    const data = await getDashboardData(session.user.id, role, clientId);

    return (
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Welcome back, {session.user.name || "there"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Show Clients count only for Admin */}
                {data.isAdmin ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Clients</p>
                                    <p className="text-2xl font-bold text-white">
                                        {data.totalClients}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Profiles</p>
                                    <p className="text-2xl font-bold text-white">
                                        {data.totalProfiles}
                                    </p>
                                </div>
                                <Store className="h-8 w-8 text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Reviews</p>
                                <p className="text-2xl font-bold text-white">
                                    {data.totalReviews}
                                </p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Pending</p>
                                <p className="text-2xl font-bold text-white">
                                    {data.pendingReviews}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Live</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {data.liveReviews}
                                </p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">In Progress</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {data.inProgressReviews}
                                </p>
                            </div>
                            <ListTodo className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Issues</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {data.issueReviews}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>

                <Link href="/reviews" className="col-span-2 lg:col-span-1">
                    <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 h-full hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-center h-full">
                            <div className="text-center">
                                <Star className="h-8 w-8 text-white mx-auto mb-2" />
                                <p className="text-white font-medium">View Reviews</p>
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
