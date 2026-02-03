/**
 * Live Check Automation API - Update Concurrency Endpoint
 *
 * POST /api/automation/concurrency
 * Body: { concurrency: number }
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
    const { concurrency } = body;

    // Validation
    if (typeof concurrency !== "number" || concurrency < 1 || concurrency > 10) {
      return NextResponse.json(
        { error: "Concurrency must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Update concurrency
    const result = automationService.updateConcurrency(concurrency);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Update concurrency error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
