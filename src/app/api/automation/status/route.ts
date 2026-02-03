/**
 * Live Check Automation API - Queue Status Endpoint
 *
 * GET /api/automation/status
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { automationService } from "@/lib/automation";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get queue statistics
    const stats = automationService.getQueueStats();
    const recentResults = automationService.getRecentResults();

    return NextResponse.json({
      success: true,
      stats,
      recentResults, // NEW: For optimistic UI updates
    });
  } catch (error) {
    console.error("Automation status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
