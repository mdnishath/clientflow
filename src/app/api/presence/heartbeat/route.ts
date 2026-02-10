/**
 * User Presence Heartbeat API
 * Tracks which users are currently online and broadcasts changes via SSE
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { onlineUsers, broadcastPresenceUpdate } from "../stream/route";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, email, role } = session.user;

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

        // Broadcast update if user just came online or status changed
        if (!wasOnline) {
            // User just came online - broadcast with event
            broadcastPresenceUpdate('user_online', id);
        } else if (previousStatus !== 'online') {
            // User status changed (was away/offline, now online)
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

        // Convert Map to array and return
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
