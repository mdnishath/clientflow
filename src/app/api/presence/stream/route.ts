import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Store for SSE connections
const connections = new Map<string, ReadableStreamDefaultController>();

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

// Broadcast presence update to all connected admin clients
export function broadcastPresenceUpdate(event: 'user_online' | 'user_offline' | 'user_away' | 'update' = 'update', userId?: string) {
    const users = Array.from(onlineUsers.values());

    const data = JSON.stringify({
        event,
        userId,
        users,
        total: users.filter(u => u.status === 'online').length,
        timestamp: Date.now(),
    });

    // Send to all connected clients
    for (const controller of connections.values()) {
        try {
            controller.enqueue(`data: ${data}\n\n`);
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

    // Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            // Store connection
            connections.set(adminId, controller);

            // Send initial data
            const users = Array.from(onlineUsers.values());
            const initialData = JSON.stringify({
                event: 'init',
                users,
                total: users.filter(u => u.status === 'online').length,
                timestamp: Date.now(),
            });

            controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

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
