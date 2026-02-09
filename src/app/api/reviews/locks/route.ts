import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { lockManager } from "@/lib/automation/locks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locks = lockManager.getAllLocks();
    return NextResponse.json({ success: true, locks });
}
