"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface DashboardChartsProps {
    dailyData: Array<{
        date: string;
        live: number;
        pending: number;
        applied: number;
        missing: number;
    }>;
    stats: {
        live: number;
        pending: number;
        applied: number;
        missing: number;
        done: number;
        googleIssue?: number;
    };
}

const COLORS = {
    live: "#10b981",
    pending: "#64748b",
    applied: "#a855f7",
    missing: "#eab308",
    done: "#059669",
    googleIssue: "#ef4444",
};

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color?: string; name?: string; value?: number | string }>; label?: string }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
            <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
            {payload.map((entry, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-400">{entry.name}:</span>
                    <span className="text-white font-semibold">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// Custom label for pie chart (only show if > 3%)
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
    if (percent < 0.04) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export function DashboardCharts({ dailyData, stats }: DashboardChartsProps) {
    // Prepare pie chart data
    const pieData = [
        { name: "Live", value: stats.live, color: COLORS.live },
        { name: "Done", value: stats.done, color: COLORS.done },
        { name: "Applied", value: stats.applied, color: COLORS.applied },
        { name: "Pending", value: stats.pending, color: COLORS.pending },
        { name: "Missing", value: stats.missing, color: COLORS.missing },
        { name: "Google Issue", value: stats.googleIssue ?? 0, color: COLORS.googleIssue },
    ].filter((item) => item.value > 0);

    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    // Format dates for better display
    const formattedDailyData = dailyData.slice(-14).map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Daily Trend Area Chart — takes 3/5 */}
            <Card className="lg:col-span-3 bg-slate-900 border-slate-700/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white text-base font-semibold">
                        Daily Trend
                        <span className="text-slate-500 text-xs font-normal ml-2">Last 14 days</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={formattedDailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.live} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.live} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.applied} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={COLORS.applied} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMissing" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.missing} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={COLORS.missing} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#475569"
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                                iconType="circle"
                                iconSize={8}
                            />
                            <Area
                                type="monotone"
                                dataKey="live"
                                stroke={COLORS.live}
                                strokeWidth={2}
                                fill="url(#colorLive)"
                                name="Live"
                                dot={false}
                                activeDot={{ r: 4, fill: COLORS.live }}
                            />
                            <Area
                                type="monotone"
                                dataKey="applied"
                                stroke={COLORS.applied}
                                strokeWidth={2}
                                fill="url(#colorApplied)"
                                name="Applied"
                                dot={false}
                                activeDot={{ r: 4, fill: COLORS.applied }}
                            />
                            <Area
                                type="monotone"
                                dataKey="missing"
                                stroke={COLORS.missing}
                                strokeWidth={1.5}
                                fill="url(#colorMissing)"
                                name="Missing"
                                dot={false}
                                activeDot={{ r: 4, fill: COLORS.missing }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Donut Chart — takes 2/5 */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-700/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white text-base font-semibold">
                        Status Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
                            No data available
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            dataKey="value"
                                            labelLine={false}
                                            label={renderCustomLabel}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    stroke="transparent"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center total */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-white">{total.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500">total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-2 space-y-1.5">
                                {pieData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-slate-400">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">{item.value.toLocaleString()}</span>
                                            <span className="text-slate-600 w-8 text-right">
                                                {total > 0 ? `${Math.round((item.value / total) * 100)}%` : '0%'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
