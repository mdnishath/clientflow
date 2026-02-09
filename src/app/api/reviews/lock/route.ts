import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { lockManager } from "@/lib/automation/locks";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
        return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
    }

    const result = lockManager.acquire(reviewId, session.user.id, session.user.name || "Worker");

    if (result.success) {
        return NextResponse.json({ success: true, message: "Lock acquired" });
    } else {
        return NextResponse.json({
            success: false,
            error: "Locked by another user",
            lockedBy: result.lockedBy
        }, { status: 409 });
    }
}

export async function GET(request: NextRequest) {
    // Return all locks logic for initial hydration
    // Wait, GET /api/reviews/lock seems weird. 
    // Maybe better GET /api/reviews/locks (plural)
    // But for simplicity, I'll put it here or create separate route?
    // Let's create separate route `api/reviews/locks` for fetching ALL.
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
