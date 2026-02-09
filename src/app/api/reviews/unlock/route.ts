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

    const success = lockManager.release(reviewId, session.user.id);

    if (success) {
        return NextResponse.json({ success: true, message: "Lock released" });
    } else {
        return NextResponse.json({ error: "Failed to release lock (not owner or not locked)" }, { status: 400 });
    }
}
