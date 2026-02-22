/**
 * Scheduled Auto-Checker
 * Allows admin to configure automatic batch checks at set times
 * Schedule config stored in .env-like JSON file
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { automationService } from "@/lib/automation";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const SCHEDULE_FILE = join(process.cwd(), "data", "schedule.json");

interface Schedule {
    enabled: boolean;
    times: string[]; // ["09:00", "18:00", "21:00"]
    concurrency: 3 | 5 | 10;
    lastRun?: string;
    timezone: string;
}

function readSchedule(userId: string): Schedule | null {
    try {
        if (!existsSync(SCHEDULE_FILE)) return null;
        const data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
        return data[userId] || null;
    } catch { return null; }
}

function writeSchedule(userId: string, schedule: Schedule) {
    try {
        const { mkdirSync } = require("fs");
        mkdirSync(join(process.cwd(), "data"), { recursive: true });
        let data: any = {};
        if (existsSync(SCHEDULE_FILE)) {
            data = JSON.parse(readFileSync(SCHEDULE_FILE, "utf-8"));
        }
        data[userId] = schedule;
        writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Schedule write error:", err);
    }
}

// GET — get schedule config
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const schedule = readSchedule(session.user.id);
    return NextResponse.json({ schedule });
}

// POST — save schedule config
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const schedule: Schedule = {
        enabled: body.enabled ?? false,
        times: body.times || [],
        concurrency: body.concurrency || 5,
        lastRun: body.lastRun,
        timezone: body.timezone || "Asia/Dhaka",
    };
    writeSchedule(session.user.id, schedule);
    return NextResponse.json({ success: true, schedule });
}

// POST /api/admin/schedule/run — trigger scheduled check now
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get checkable reviews
        const reviews = await prisma.review.findMany({
            where: {
                isArchived: false,
                reviewLiveLink: { not: null },
                status: { notIn: ["PENDING", "IN_PROGRESS"] },
                profile: { client: { userId: session.user.id } },
            },
            select: { id: true },
            take: 500,
        });

        if (reviews.length === 0) {
            return NextResponse.json({ message: "No checkable reviews found" });
        }

        const ids = reviews.map(r => r.id);
        const schedule = readSchedule(session.user.id);
        const concurrency = (schedule?.concurrency || 5) as 3 | 5 | 10;

        // Update last run
        if (schedule) {
            schedule.lastRun = new Date().toISOString();
            writeSchedule(session.user.id, schedule);
        }

        // Set concurrency then start batch check
        automationService.updateConcurrency(concurrency);
        automationService.startChecks(ids, session.user.id);

        return NextResponse.json({
            success: true,
            message: `Auto-check started for ${ids.length} reviews`,
            count: ids.length,
        });
    } catch (error) {
        console.error("Schedule run error:", error);
        return NextResponse.json({ error: "Failed to start auto-check" }, { status: 500 });
    }
}
