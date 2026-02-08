"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileProgress {
    businessName: string;
    category: string;
    clientName: string;
    reviewOrdered: number;
    reviewLimit: number;
    liveCount: number;
    remaining: number;
    completionRate: number;
}

interface ProfileProgressData {
    profiles: ProfileProgress[];
    summary: {
        totalProfiles: number;
        totalOrdered: number;
        totalLive: number;
        totalRemaining: number;
        avgCompletionRate: number;
    };
}

export function ProfileProgressReport() {
    const [data, setData] = useState<ProfileProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/reports/profile-progress");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch profile progress:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Loading report...</div>
            </div>
        );
    }

    if (!data || data.profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileDown size={48} className="mb-3 opacity-30" />
                <p>No profile data available</p>
                <p className="text-xs mt-1">Profiles must have reviewOrdered &gt; 0</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Profiles</p>
                        <p className="text-2xl font-bold text-white">{data.summary.totalProfiles}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Ordered</p>
                        <p className="text-2xl font-bold text-blue-400">{data.summary.totalOrdered}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Live</p>
                        <p className="text-2xl font-bold text-green-400">{data.summary.totalLive}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-amber-400">{data.summary.totalRemaining}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg. Progress</p>
                        <p className="text-2xl font-bold text-cyan-400">{data.summary.avgCompletionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Profile Progress Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Business</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Ordered</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Limit</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Live</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Remaining</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.profiles.map((profile, idx) => (
                                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                        <td className="py-3 px-4 text-sm text-white font-medium">{profile.businessName}</td>
                                        <td className="py-3 px-4 text-sm text-slate-300">{profile.category}</td>
                                        <td className="py-3 px-4 text-sm text-slate-300">{profile.clientName}</td>
                                        <td className="py-3 px-4 text-sm text-center text-blue-400 font-medium">{profile.reviewOrdered}</td>
                                        <td className="py-3 px-4 text-sm text-center text-slate-400">{profile.reviewLimit}</td>
                                        <td className="py-3 px-4 text-sm text-center text-green-400 font-medium">{profile.liveCount}</td>
                                        <td className="py-3 px-4 text-sm text-center text-amber-400 font-medium">{profile.remaining}</td>
                                        <td className="py-3 px-4 text-sm text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                                        style={{ width: `${Math.min(100, profile.completionRate)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-slate-300 w-10 text-right">
                                                    {profile.completionRate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
