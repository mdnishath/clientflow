/**
 * Live Check Automation API - Start Check Endpoint
 *
 * POST /api/automation/check
 * Body: { reviewIds: string[] }
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

    // Parse request body
    const body = await request.json();
    const { reviewIds } = body;

    // Validation
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid reviewIds array" },
        { status: 400 }
      );
    }

    // Start automation
    const result = await automationService.startChecks(reviewIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Automation check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
