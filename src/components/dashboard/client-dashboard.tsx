"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Store,
    BarChart3,
} from "lucide-react";
import Link from "next/link";

interface ClientDashboardProps {
    totalProfiles: number;
    totalReviews: number;
    pendingReviews: number;
    liveReviews: number;
    doneReviews: number;
    issueReviews: number;
    isClient: boolean;
}

export function ClientDashboard({
    totalProfiles,
    totalReviews,
    pendingReviews,
    liveReviews,
    doneReviews,
    issueReviews,
    isClient,
}: ClientDashboardProps) {
    if (!isClient) return null;

    const completionRate = totalReviews > 0
        ? Math.round((liveReviews / totalReviews) * 100)
        : 0;

    return (
        <div className="space-y-6 mb-8">
            {/* Title */}
            <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-400" />
                <h2 className="text-xl font-semibold text-white">Your Project Overview</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Profiles */}
                <Link href="/profiles">
                    <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                Your Profiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalProfiles}</div>
                            <p className="text-xs text-slate-400 mt-1">Business locations</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Total Reviews */}
                <Link href="/reviews">
                    <Card className="bg-gradient-to-br from-blue-900/30 to-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Total Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400">{totalReviews}</div>
                            <p className="text-xs text-slate-400 mt-1">All reviews</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* LIVE Reviews */}
                <Link href="/reviews?status=LIVE">
                    <Card className="bg-gradient-to-br from-green-900/30 to-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                LIVE Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">{liveReviews}</div>
                            <p className="text-xs text-slate-400 mt-1">Currently live</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* DONE Reviews */}
                <Link href="/reviews?status=DONE">
                    <Card className="bg-gradient-to-br from-cyan-900/30 to-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                DONE
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-cyan-400">{doneReviews}</div>
                            <p className="text-xs text-slate-400 mt-1">Completed</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Pending Reviews */}
                <Link href="/reviews?status=PENDING">
                    <Card className="bg-gradient-to-br from-yellow-900/30 to-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">{pendingReviews}</div>
                            <p className="text-xs text-slate-400 mt-1">Awaiting action</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Progress Bar */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Completion Rate</span>
                            <span className="text-slate-400 font-semibold">{completionRate}%</span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{liveReviews}</div>
                            <div className="text-xs text-slate-400 mt-1">LIVE</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">{doneReviews}</div>
                            <div className="text-xs text-slate-400 mt-1">DONE</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{pendingReviews}</div>
                            <div className="text-xs text-slate-400 mt-1">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">{issueReviews}</div>
                            <div className="text-xs text-slate-400 mt-1">Issues</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions for Client */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link href="/profiles">
                            <div className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-600 hover:border-indigo-500">
                                <div className="flex items-center gap-3">
                                    <Store className="h-5 w-5 text-indigo-400" />
                                    <div>
                                        <div className="font-medium text-white">View Profiles</div>
                                        <div className="text-xs text-slate-400">Manage your business locations</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/reviews">
                            <div className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-600 hover:border-green-500">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    <div>
                                        <div className="font-medium text-white">View Reviews</div>
                                        <div className="text-xs text-slate-400">Check all your reviews</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
