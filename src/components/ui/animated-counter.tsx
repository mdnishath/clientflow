"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({
    value,
    duration = 1000,
    suffix = "",
    prefix = "",
    className = "",
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(0);

    useEffect(() => {
        startValueRef.current = displayValue;
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.round(
                startValueRef.current + (value - startValueRef.current) * easeOut
            );

            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
    );
}
