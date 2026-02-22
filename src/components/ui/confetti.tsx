"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
    trigger: boolean;
    type?: "success" | "epic" | "fireworks";
}

export function Confetti({ trigger, type = "success" }: ConfettiProps) {
    useEffect(() => {
        if (!trigger) return;

        if (type === "epic") {
            // Epic multi-burst confetti
            const duration = 4000;
            const end = Date.now() + duration;
            const colors = ["#6366f1", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors,
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        } else if (type === "fireworks") {
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
            const interval = setInterval(() => {
                confetti({
                    ...defaults,
                    particleCount: randomInRange(20, 40),
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
                });
            }, 250);
            setTimeout(() => clearInterval(interval), 3000);
        } else {
            // Simple success burst
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#6366f1", "#a855f7", "#10b981"],
                zIndex: 9999,
            });
        }
    }, [trigger, type]);

    return null;
}

/**
 * Fire confetti programmatically from anywhere
 */
export function fireConfetti(type: "success" | "epic" | "fireworks" = "success") {
    if (typeof window === "undefined") return;

    if (type === "epic") {
        const duration = 4000;
        const end = Date.now() + duration;
        const colors = ["#6366f1", "#a855f7", "#10b981", "#f59e0b", "#ef4444"];
        const frame = () => {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    } else if (type === "fireworks") {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval = setInterval(() => {
            confetti({
                ...defaults,
                particleCount: randomInRange(20, 40),
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
            });
        }, 250);
        setTimeout(() => clearInterval(interval), 3000);
    } else {
        confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#6366f1", "#a855f7", "#10b981", "#f59e0b"],
            zIndex: 9999,
        });
    }
}
