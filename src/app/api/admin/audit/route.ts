/**
 * GET /api/admin/audit - Get audit logs (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuditLogs } from "@/lib/audit";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");
    const entity = searchParams.get("entity") || undefined;
    const action = searchParams.get("action") || undefined;
    const userId = searchParams.get("userId") || undefined;

    try {
        const result = await getAuditLogs({
            adminId: session.user.id,
            limit,
            offset,
            entity,
            action,
            userId,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Audit log error:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
