"use client";

import { useMemo, useState, useEffect } from "react";
import { subDays, startOfWeek, addDays } from "date-fns";

interface ActivityData {
    date: string; // ISO date string
    count: number;
}

interface ActivityHeatMapProps {
    data: ActivityData[];
    weeks?: number;
    className?: string;
}

const CELL_SIZE = 12;
const CELL_GAP = 2;
const DAYS_IN_WEEK = 7;

const getIntensityColor = (count: number, maxCount: number): string => {
    if (count === 0) return "#1e293b"; // slate-800
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "#164e63"; // cyan-900
    if (ratio <= 0.5) return "#0891b2"; // cyan-600
    if (ratio <= 0.75) return "#22d3ee"; // cyan-400
    return "#67e8f9"; // cyan-300
};

// Simple date formatter to avoid hydration issues
const formatDate = (date: Date): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export function ActivityHeatMap({
    data,
    weeks = 12,
    className = "",
}: ActivityHeatMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { grid, maxCount, days } = useMemo(() => {
        const endDate = new Date();
        const startDate = subDays(endDate, weeks * 7);

        // Create a map for quick lookup
        const dataMap = new Map<string, number>();
        data.forEach((d) => {
            const dateKey = formatDateKey(new Date(d.date));
            dataMap.set(dateKey, d.count);
        });

        // Find max count for intensity calculation
        const maxCount = Math.max(...data.map((d) => d.count), 1);

        // Generate grid
        const grid: { date: Date; dateStr: string; count: number }[][] = [];
        let currentDate = startOfWeek(startDate, { weekStartsOn: 0 }); // Start from Sunday

        for (let week = 0; week < weeks; week++) {
            const weekData: { date: Date; dateStr: string; count: number }[] = [];
            for (let day = 0; day < DAYS_IN_WEEK; day++) {
                const dateKey = formatDateKey(currentDate);
                weekData.push({
                    date: new Date(currentDate),
                    dateStr: formatDate(currentDate),
                    count: dataMap.get(dateKey) || 0,
                });
                currentDate = addDays(currentDate, 1);
            }
            grid.push(weekData);
        }

        // Day labels
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return { grid, maxCount, days };
    }, [data, weeks]);

    const width = weeks * (CELL_SIZE + CELL_GAP) + 30;
    const height = DAYS_IN_WEEK * (CELL_SIZE + CELL_GAP) + 20;

    // Render placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className={className}>
                <div
                    style={{ width, height }}
                    className="bg-slate-800/50 rounded animate-pulse"
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <svg width={width} height={height}>
                {/* Day labels */}
                {days.map((day, i) =>
                    i % 2 === 1 ? (
                        <text
                            key={day}
                            x={0}
                            y={i * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 8}
                            className="fill-slate-500 text-[10px]"
                        >
                            {day}
                        </text>
                    ) : null
                )}

                {/* Grid cells */}
                {grid.map((week, weekIndex) =>
                    week.map((day, dayIndex) => (
                        <g key={`${weekIndex}-${dayIndex}`}>
                            <rect
                                x={30 + weekIndex * (CELL_SIZE + CELL_GAP)}
                                y={dayIndex * (CELL_SIZE + CELL_GAP)}
                                width={CELL_SIZE}
                                height={CELL_SIZE}
                                rx={2}
                                fill={getIntensityColor(day.count, maxCount)}
                                className="transition-colors duration-200 hover:stroke-white hover:stroke-1"
                            >
                                <title>
                                    {day.dateStr}: {day.count} reviews
                                </title>
                            </rect>
                        </g>
                    ))
                )}
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span>Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: getIntensityColor(ratio * 10, 10) }}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
