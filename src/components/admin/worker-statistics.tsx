"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    TrendingUp,
    CheckCircle2,
    Calendar,
    ChevronDown,
    ChevronUp,
    Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkerStat {
    id: string;
    name: string | null;
    email: string;
    stats: {
        created: Record<string, number>;
        updated: Record<string, number>;
        totalCreated: number;
        totalUpdated: number;
        totalLive: number;
    };
}

interface WorkerDetailStats {
    created: number;
    updated: number;
    liveCount: number;
    totalTouched: number;
    successRate: number;
    thisWeek: number;
    thisMonth: number;
    statusBreakdown: Array<{ status: string; count: number }>;
    dailyStats: Array<{ date: string; total: number }>;
    projectWiseStats?: Array<{
        clientId: string;
        clientName: string;
        reviewCount: number;
        profileCount: number;
        profiles: string[];
    }>;
}

export function WorkerStatistics() {
    const [workers, setWorkers] = useState<WorkerStat[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
    const [workerDetails, setWorkerDetails] = useState<WorkerDetailStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await fetch("/api/admin/workers/stats");
            if (res.ok) {
                const data = await res.json();
                setWorkers(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch workers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerDetails = async (workerId: string) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/workers/${workerId}/stats`);
            if (res.ok) {
                const data = await res.json();
                setWorkerDetails(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch worker details:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const toggleWorkerDetails = (workerId: string) => {
        if (selectedWorker === workerId) {
            setSelectedWorker(null);
            setWorkerDetails(null);
        } else {
            setSelectedWorker(workerId);
            fetchWorkerDetails(workerId);
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-slate-700 rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Worker Performance Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                {workers.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No workers found</p>
                ) : (
                    <div className="space-y-3">
                        {workers.map((worker) => (
                            <div key={worker.id} className="border border-slate-700 rounded-lg overflow-hidden">
                                {/* Worker Summary */}
                                <div
                                    className="p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors cursor-pointer"
                                    onClick={() => toggleWorkerDetails(worker.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                {(worker.name || worker.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white">
                                                    {worker.name || worker.email}
                                                </h3>
                                                <p className="text-sm text-slate-400">{worker.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm text-slate-400">Created</div>
                                                <div className="text-lg font-bold text-blue-400">
                                                    {worker.stats.totalCreated}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-slate-400">LIVE</div>
                                                <div className="text-lg font-bold text-green-400">
                                                    {worker.stats.totalLive}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400"
                                            >
                                                {selectedWorker === worker.id ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Worker Details */}
                                {selectedWorker === worker.id && (
                                    <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                                        {detailsLoading ? (
                                            <div className="space-y-3">
                                                <div className="h-24 bg-slate-700 rounded animate-pulse" />
                                                <div className="h-24 bg-slate-700 rounded animate-pulse" />
                                            </div>
                                        ) : workerDetails ? (
                                            <div className="space-y-6">
                                                {/* KPI Stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-3 bg-slate-800 rounded-lg">
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            Total Touched
                                                        </div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {workerDetails.totalTouched}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-800 rounded-lg">
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            Success Rate
                                                        </div>
                                                        <div className="text-2xl font-bold text-green-400">
                                                            {workerDetails.successRate}%
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-800 rounded-lg">
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            This Week
                                                        </div>
                                                        <div className="text-2xl font-bold text-indigo-400">
                                                            {workerDetails.thisWeek}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-800 rounded-lg">
                                                        <div className="text-xs text-slate-400 mb-1">
                                                            This Month
                                                        </div>
                                                        <div className="text-2xl font-bold text-purple-400">
                                                            {workerDetails.thisMonth}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Breakdown */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-indigo-400" />
                                                        Status Breakdown
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {workerDetails.statusBreakdown.map((item) => {
                                                            const colors: Record<string, string> = {
                                                                LIVE: "bg-green-500",
                                                                PENDING: "bg-slate-500",
                                                                APPLIED: "bg-purple-500",
                                                                MISSING: "bg-yellow-500",
                                                                DONE: "bg-emerald-500",
                                                                GOOGLE_ISSUE: "bg-red-500",
                                                            };
                                                            return (
                                                                <div
                                                                    key={item.status}
                                                                    className="p-2 bg-slate-800 rounded flex items-center justify-between"
                                                                >
                                                                    <span className="text-xs text-slate-300">
                                                                        {item.status.replace("_", " ")}
                                                                    </span>
                                                                    <Badge className={`${colors[item.status]} text-white`}>
                                                                        {item.count}
                                                                    </Badge>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Project-Wise Stats */}
                                                {workerDetails.projectWiseStats && workerDetails.projectWiseStats.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                                            <Briefcase className="h-4 w-4 text-indigo-400" />
                                                            Projects Worked On
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {workerDetails.projectWiseStats.map((project) => (
                                                                <div
                                                                    key={project.clientId}
                                                                    className="p-3 bg-slate-800 rounded-lg flex items-center justify-between"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-white text-sm">
                                                                            {project.clientName}
                                                                        </div>
                                                                        <div className="text-xs text-slate-400">
                                                                            {project.profileCount} profiles
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-lg font-bold text-indigo-400">
                                                                            {project.reviewCount}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500">reviews</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">
                                                Failed to load details
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
