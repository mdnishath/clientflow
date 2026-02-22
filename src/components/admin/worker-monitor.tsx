"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Circle, Monitor, Users, Activity, Clock } from "lucide-react";

interface WorkerStatus {
    id: string;
    name: string;
    email: string;
    status: "online" | "away" | "offline";
    lastSeen: string;
    currentPage: string;
    pageLabel: string;
    lastAction?: string;
    lastActionAt?: string;
}

interface MonitorData {
    workers: WorkerStatus[];
    summary: {
        total: number;
        online: number;
        away: number;
        offline: number;
    };
}

const statusConfig = {
    online: { color: "text-green-400", bg: "bg-green-400", label: "Online" },
    away: { color: "text-yellow-400", bg: "bg-yellow-400", label: "Away" },
    offline: { color: "text-slate-600", bg: "bg-slate-600", label: "Offline" },
};

const pageColors: Record<string, string> = {
    "Dashboard": "text-blue-400",
    "Live Checker": "text-green-400",
    "Reviews": "text-purple-400",
    "Generator": "text-yellow-400",
    "Profiles": "text-cyan-400",
    "Performance": "text-orange-400",
};

export function WorkerMonitor() {
    const [data, setData] = useState<MonitorData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/worker-monitor");
            if (res.ok) {
                const d = await res.json();
                setData(d);
            }
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Refresh every 10 seconds — stealth, no loading indicator on refresh
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) return null;
    if (!data || data.workers.length === 0) return null;

    return (
        <Card className="bg-slate-900 border-slate-700/60 mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Monitor size={16} className="text-indigo-400" />
                        Worker Monitor
                        <span className="text-xs text-slate-500 font-normal">— stealth mode</span>
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-400">● {data.summary.online} online</span>
                        {data.summary.away > 0 && <span className="text-yellow-400">● {data.summary.away} away</span>}
                        <span className="text-slate-600">{data.summary.offline} offline</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data.workers.map((worker) => {
                        const sc = statusConfig[worker.status];
                        const pageColor = pageColors[worker.pageLabel] || "text-slate-400";

                        return (
                            <div
                                key={worker.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/40"
                            >
                                {/* Status dot */}
                                <div className="relative shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {worker.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${sc.bg}`} />
                                </div>

                                {/* Worker info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{worker.name}</span>
                                        <span className={`text-xs ${sc.color}`}>{sc.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{worker.email}</p>
                                </div>

                                {/* Current activity */}
                                <div className="text-right shrink-0">
                                    {worker.status !== "offline" ? (
                                        <>
                                            <div className={`flex items-center gap-1 justify-end text-xs font-medium ${pageColor}`}>
                                                <Activity size={11} />
                                                {worker.pageLabel}
                                            </div>
                                            {worker.lastAction && (
                                                <p className="text-xs text-slate-600 mt-0.5 max-w-[160px] truncate">{worker.lastAction}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1 justify-end text-xs text-slate-600">
                                            <Clock size={11} />
                                            {worker.lastSeen}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-slate-700 mt-3 text-center">
                    👁 Workers are not notified of this monitoring
                </p>
            </CardContent>
        </Card>
    );
}
