"use client";

import { useMemo } from "react";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    className?: string;
    color?: string;
    fillOpacity?: number;
}

export function Sparkline({
    data,
    width = 100,
    height = 30,
    className = "",
    color = "#6366f1",
    fillOpacity = 0.2,
}: SparklineProps) {
    const path = useMemo(() => {
        if (data.length < 2) return "";

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const padding = 2;
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * usableWidth;
            const y = padding + usableHeight - ((value - min) / range) * usableHeight;
            return { x, y };
        });

        // Line path
        const linePath = points.reduce((acc, point, i) => {
            return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, "");

        return linePath;
    }, [data, width, height]);

    const areaPath = useMemo(() => {
        if (data.length < 2) return "";

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const padding = 2;
        const usableWidth = width - padding * 2;
        const usableHeight = height - padding * 2;

        const points = data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * usableWidth;
            const y = padding + usableHeight - ((value - min) / range) * usableHeight;
            return { x, y };
        });

        // Area path (closed)
        let areaPath = points.reduce((acc, point, i) => {
            return acc + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, "");

        // Close the area
        areaPath += ` L ${points[points.length - 1].x} ${height - padding}`;
        areaPath += ` L ${padding} ${height - padding} Z`;

        return areaPath;
    }, [data, width, height]);

    if (data.length < 2) {
        return <div className={className} style={{ width, height }} />;
    }

    return (
        <svg width={width} height={height} className={className}>
            {/* Gradient fill */}
            <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            {/* Area */}
            <path d={areaPath} fill="url(#sparklineGradient)" />
            {/* Line */}
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            {data.length > 0 && (
                <circle
                    cx={width - 2}
                    cy={
                        2 +
                        (height - 4) -
                        ((data[data.length - 1] - Math.min(...data)) /
                            (Math.max(...data) - Math.min(...data) || 1)) *
                        (height - 4)
                    }
                    r={2.5}
                    fill={color}
                />
            )}
        </svg>
    );
}
