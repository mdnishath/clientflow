"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Info, X, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Alert {
    type: string;
    level: "critical" | "warning" | "info";
    count: number;
    message: string;
    action: string;
}

const levelConfig = {
    critical: {
        bg: "bg-red-500/10 border-red-500/25",
        icon: AlertCircle,
        iconColor: "text-red-400",
        badge: "bg-red-500/20 text-red-400",
        dot: "bg-red-400 animate-pulse",
    },
    warning: {
        bg: "bg-yellow-500/10 border-yellow-500/25",
        icon: AlertTriangle,
        iconColor: "text-yellow-400",
        badge: "bg-yellow-500/20 text-yellow-400",
        dot: "bg-yellow-400",
    },
    info: {
        bg: "bg-blue-500/10 border-blue-500/25",
        icon: Info,
        iconColor: "text-blue-400",
        badge: "bg-blue-500/20 text-blue-400",
        dot: "bg-blue-400",
    },
};

export function AtRiskAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/stats/at-risk")
            .then(r => r.json())
            .then(d => setAlerts(d.alerts || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.type));

    if (loading || visibleAlerts.length === 0) return null;

    return (
        <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Smart Alerts</span>
                <span className="text-xs text-slate-600">— {visibleAlerts.length} active</span>
            </div>
            {visibleAlerts.map((alert) => {
                const config = levelConfig[alert.level];
                const Icon = config.icon;
                return (
                    <div
                        key={alert.type}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${config.bg} group`}
                    >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                        <Icon size={16} className={`${config.iconColor} shrink-0`} />
                        <p className="text-sm text-slate-200 flex-1">{alert.message}</p>
                        <Link
                            href={alert.action}
                            className={`text-xs px-2 py-0.5 rounded-full ${config.badge} flex items-center gap-1 hover:opacity-80 shrink-0`}
                        >
                            Fix <ChevronRight size={10} />
                        </Link>
                        <button
                            onClick={() => setDismissed(prev => new Set([...prev, alert.type]))}
                            className="text-slate-600 hover:text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
