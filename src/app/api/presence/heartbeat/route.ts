/**
 * User Presence Heartbeat API
 * Tracks which users are currently online and broadcasts changes via SSE
 * Extended to support stealth activity monitoring (admin can see worker activity)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { onlineUsers, broadcastPresenceUpdate } from "../stream/route";

// In-memory activity tracking (stealth — workers don't see this)
export const userActivity = new Map<string, {
    currentPage: string;
    pageTitle: string;
    lastAction?: string;
    lastActionAt: number;
}>();

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, email, role } = session.user;
        const body = await req.json().catch(() => ({}));

        // Check if user was already online
        const wasOnline = onlineUsers.has(id);
        const previousStatus = onlineUsers.get(id)?.status;

        // Update user's presence
        onlineUsers.set(id, {
            userId: id,
            name: name || null,
            email: email || "",
            role,
            lastSeen: Date.now(),
            status: 'online',
        });

        // Update activity (from heartbeat payload)
        if (body.page) {
            userActivity.set(id, {
                currentPage: body.page || "/",
                pageTitle: body.title || "Dashboard",
                lastAction: body.action,
                lastActionAt: Date.now(),
            });
        }

        // Broadcast update
        if (!wasOnline) {
            broadcastPresenceUpdate('user_online', id);
        } else if (previousStatus !== 'online') {
            broadcastPresenceUpdate('update', id);
        } else if (body.page) {
            // Silently update without notifying user - stealth
            broadcastPresenceUpdate('update', id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Heartbeat error:", error);
        return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = Array.from(onlineUsers.values());
        return NextResponse.json({
            success: true,
            users,
            online: users.filter(u => u.status === 'online').length,
            total: users.length,
        });
    } catch (error) {
        console.error("Get online users error:", error);
        return NextResponse.json({ error: "Failed to get online users" }, { status: 500 });
    }
}
