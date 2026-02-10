"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
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
    };
}

const COLORS = {
    live: "#10b981",
    pending: "#64748b",
    applied: "#a855f7",
    missing: "#eab308",
    done: "#059669",
};

export function DashboardCharts({ dailyData, stats }: DashboardChartsProps) {
    // Prepare pie chart data
    const pieData = [
        { name: "Live", value: stats.live, color: COLORS.live },
        { name: "Pending", value: stats.pending, color: COLORS.pending },
        { name: "Applied", value: stats.applied, color: COLORS.applied },
        { name: "Missing", value: stats.missing, color: COLORS.missing },
        { name: "Done", value: stats.done, color: COLORS.done },
    ].filter((item) => item.value > 0);

    // Format dates for better display
    const formattedDailyData = dailyData.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend Line Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Daily Trend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formattedDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                            />
                            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "#f1f5f9" }}
                            />
                            <Legend
                                wrapperStyle={{ fontSize: "12px" }}
                                iconType="line"
                            />
                            <Line
                                type="monotone"
                                dataKey="live"
                                stroke={COLORS.live}
                                strokeWidth={2}
                                dot={{ fill: COLORS.live }}
                                name="Live"
                            />
                            <Line
                                type="monotone"
                                dataKey="pending"
                                stroke={COLORS.pending}
                                strokeWidth={2}
                                dot={{ fill: COLORS.pending }}
                                name="Pending"
                            />
                            <Line
                                type="monotone"
                                dataKey="applied"
                                stroke={COLORS.applied}
                                strokeWidth={2}
                                dot={{ fill: COLORS.applied }}
                                name="Applied"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
