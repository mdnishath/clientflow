/**
 * Live Check Automation API - Reset Queue Endpoint
 *
 * POST /api/automation/reset
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { automationService } from "@/lib/automation";

export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Reset queue for this user
        const result = automationService.resetQueue(session.user.id);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Reset automation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
