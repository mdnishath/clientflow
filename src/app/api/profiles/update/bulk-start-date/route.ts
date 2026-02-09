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
        const { startDate } = body;

        if (!startDate) {
            return NextResponse.json({ error: "Start date is required" }, { status: 400 });
        }

        const date = new Date(startDate);
        if (isNaN(date.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const result = await prisma.gmbProfile.updateMany({
            where: {
                client: { userId: scope.userId },
                isArchived: false,
            },
            data: {
                reviewsStartDate: date,
            },
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully set start date to ${date.toLocaleDateString()} for ${result.count} profiles`,
        });
    } catch (error) {
        console.error("Error updating bulk start date:", error);
        return NextResponse.json(
            { error: "Failed to update start dates" },
            { status: 500 }
        );
    }
}
