import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Store for SSE connections with admin metadata for filtering
const connections = new Map<string, {
    controller: ReadableStreamDefaultController;
    workerIds: Set<string>;
    clientIds: Set<string>;
}>();

// Store for online users with detailed info
export const onlineUsers = new Map<string, {
    userId: string;
    name: string | null;
    email: string;
    role: string;
    lastSeen: number;
    status: 'online' | 'away' | 'offline';
}>();

// Cleanup interval - mark users as offline after 30 seconds of no heartbeat
const OFFLINE_THRESHOLD = 30000; // 30 seconds
const AWAY_THRESHOLD = 120000; // 2 minutes

setInterval(() => {
    const now = Date.now();
    let hasChanges = false;

    for (const [userId, user] of onlineUsers.entries()) {
        const timeSinceLastSeen = now - user.lastSeen;

        if (timeSinceLastSeen > OFFLINE_THRESHOLD) {
            if (user.status !== 'offline') {
                user.status = 'offline';
                hasChanges = true;
            }
        } else if (timeSinceLastSeen > AWAY_THRESHOLD) {
            if (user.status !== 'away') {
                user.status = 'away';
                hasChanges = true;
            }
        }
    }

    // Broadcast changes if any
    if (hasChanges) {
        broadcastPresenceUpdate();
    }
}, 10000); // Check every 10 seconds

// Broadcast presence update to all connected admin clients (ISOLATED per admin)
export function broadcastPresenceUpdate(event: 'user_online' | 'user_offline' | 'user_away' | 'update' = 'update', userId?: string) {
    const allUsers = Array.from(onlineUsers.values());

    // Send filtered data to each admin
    for (const [adminId, conn] of connections.entries()) {
        try {
            // Filter users: admin themselves + their workers + their clients
            const filteredUsers = allUsers.filter(user =>
                user.userId === adminId ||
                conn.workerIds.has(user.userId) ||
                conn.clientIds.has(user.userId)
            );

            const data = JSON.stringify({
                event,
                userId,
                users: filteredUsers,
                total: filteredUsers.filter(u => u.status === 'online').length,
                timestamp: Date.now(),
            });

            conn.controller.enqueue(`data: ${data}\n\n`);
        } catch (error) {
            console.error("Failed to send SSE message:", error);
        }
    }
}

// GET /api/presence/stream - SSE endpoint for real-time presence updates (ADMIN only)
export async function GET(req: NextRequest) {
    const session = await auth();

    // Only admins can subscribe to presence updates
    if (!session?.user || session.user.role !== "ADMIN") {
        return new Response("Unauthorized", { status: 401 });
    }

    const adminId = session.user.id;

    // Helper function to filter users for this admin only (ISOLATED)
    const getFilteredUsers = async () => {
        const allUsers = Array.from(onlineUsers.values());

        // Get admin's workers and clients from database
        const [workers, clients] = await Promise.all([
            prisma.user.findMany({
                where: {
                    parentAdminId: adminId,
                    role: "WORKER",
                },
                select: { id: true },
            }),
            prisma.client.findMany({
                where: {
                    userId: adminId,
                },
                select: {
                    userAccount: {
                        select: { id: true },
                    },
                },
            }),
        ]);

        const workerIds = new Set(workers.map(w => w.id));
        const clientIds = new Set(
            clients
                .filter(c => c.userAccount?.id)
                .map(c => c.userAccount!.id)
        );

        // Filter: admin themselves + their workers + their clients
        return allUsers.filter(user =>
            user.userId === adminId ||
            workerIds.has(user.userId) ||
            clientIds.has(user.userId)
        );
    };

    // Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Get and cache worker/client IDs for this admin
            const [workers, clients] = await Promise.all([
                prisma.user.findMany({
                    where: {
                        parentAdminId: adminId,
                        role: "WORKER",
                    },
                    select: { id: true },
                }),
                prisma.client.findMany({
                    where: {
                        userId: adminId,
                    },
                    select: {
                        userAccount: {
                            select: { id: true },
                        },
                    },
                }),
            ]);

            const workerIds = new Set(workers.map(w => w.id));
            const clientIds = new Set(
                clients
                    .filter(c => c.userAccount?.id)
                    .map(c => c.userAccount!.id)
            );

            // Store connection with metadata
            connections.set(adminId, {
                controller,
                workerIds,
                clientIds,
            });

            // Send initial filtered data
            try {
                const users = await getFilteredUsers();
                const initialData = JSON.stringify({
                    event: 'init',
                    users,
                    total: users.filter(u => u.status === 'online').length,
                    timestamp: Date.now(),
                });
                controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));
            } catch (err) {
                console.error("Failed to get filtered users:", err);
            }

            // Send heartbeat every 15 seconds to keep connection alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`: heartbeat\n\n`));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 15000);

            // Cleanup on close
            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                connections.delete(adminId);
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable buffering for nginx
        },
    });
}
