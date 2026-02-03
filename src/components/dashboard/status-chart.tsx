"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatusChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

export function StatusChart({ data }: StatusChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "#fff",
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
