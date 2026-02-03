"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface OverviewChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", backgroundColor: "#1e293b", color: "#fff" }}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-indigo-500"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
