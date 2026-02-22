/**
 * GET /api/admin/worker-monitor
 * Real-time worker activity monitor (admin only, stealth)
 * Workers cannot know this is being accessed
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onlineUsers } from "@/app/api/presence/stream/route";
import { userActivity } from "@/app/api/presence/heartbeat/route";

const PAGE_LABELS: Record<string, string> = {
    "/": "Dashboard",
    "/reviews": "Reviews",
    "/profiles": "Profiles",
    "/checker": "Live Checker",
    "/generator": "Generator",
    "/performance": "Performance",
    "/settings": "Settings",
    "/reports": "Reports",
};

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get all workers under this admin
        const workers = await prisma.user.findMany({
            where: {
                parentAdminId: session.user.id,
                role: "WORKER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        const now = Date.now();

        const workerStatus = workers.map(worker => {
            const presence = onlineUsers.get(worker.id);
            const activity = userActivity.get(worker.id);

            const isOnline = presence?.status === 'online' && presence.lastSeen > now - 60000;
            const isAway = presence?.status === 'away' || (presence && presence.lastSeen > now - 300000 && !isOnline);

            const lastSeenMs = presence ? now - presence.lastSeen : null;
            const lastSeenStr = lastSeenMs !== null
                ? lastSeenMs < 60000 ? "Just now"
                    : lastSeenMs < 3600000 ? `${Math.floor(lastSeenMs / 60000)}m ago`
                        : `${Math.floor(lastSeenMs / 3600000)}h ago`
                : "Never";

            const pagePath = activity?.currentPage || "/";
            const pageLabel = PAGE_LABELS[pagePath] ||
                pagePath.startsWith("/checker") ? "Live Checker" :
                    pagePath.startsWith("/reviews") ? "Reviews" :
                        pagePath.startsWith("/profiles") ? "Profiles" :
                            pagePath.startsWith("/clients") ? "Clients" :
                                activity?.pageTitle || pagePath;

            return {
                id: worker.id,
                name: worker.name || "Unknown",
                email: worker.email,
                status: isOnline ? "online" : isAway ? "away" : "offline",
                lastSeen: lastSeenStr,
                currentPage: pagePath,
                pageLabel: typeof pageLabel === 'string' ? pageLabel : String(pageLabel),
                lastAction: activity?.lastAction || null,
                lastActionAt: activity?.lastActionAt ? new Date(activity.lastActionAt).toISOString() : null,
            };
        });

        return NextResponse.json({
            workers: workerStatus,
            summary: {
                total: workers.length,
                online: workerStatus.filter(w => w.status === "online").length,
                away: workerStatus.filter(w => w.status === "away").length,
                offline: workerStatus.filter(w => w.status === "offline").length,
            }
        });
    } catch (error) {
        console.error("Worker monitor error:", error);
        return NextResponse.json({ error: "Failed to get worker status" }, { status: 500 });
    }
}
