/**
 * Live Check Automation API - Stop Checks Endpoint
 *
 * POST /api/automation/stop
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

    // Stop checks
    const result = automationService.stopChecks();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stop automation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
