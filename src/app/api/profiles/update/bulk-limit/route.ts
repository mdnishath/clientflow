import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function POST(request: Request) {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can use this endpoint
    if (!scope.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const limit = parseInt(body.limit);

        if (isNaN(limit) || limit < 0) {
            return NextResponse.json({ error: "Invalid limit value" }, { status: 400 });
        }

        const result = await prisma.gmbProfile.updateMany({
            where: {
                // Apply scope to admin's hierarchy
                client: { userId: scope.userId },
                isArchived: false,
            },
            data: {
                reviewLimit: limit,
            },
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully set review limit to ${limit} for ${result.count} profiles`,
        });
    } catch (error) {
        console.error("Error updating bulk limit:", error);
        return NextResponse.json(
            { error: "Failed to update review limits" },
            { status: 500 }
        );
    }
}
