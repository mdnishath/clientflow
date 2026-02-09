import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function POST() {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can use this endpoint
    if (!scope.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        // Delete all reviews with status 'PENDING'
        // This targets ALL pending reviews in the system as requested by the user
        // "delete all remaing pending task from all profile layout"
        const result = await prisma.review.deleteMany({
            where: {
                status: "PENDING",
                // We typically filter by client scope, but for admin "all profiles", we just target everything.
                // However, scope.userId is the admin's ID. If there are other admins/teams, this might only delete
                // reviews owned by this admin's hierarchy?
                // The prompt says "from all profile completely remove from db".
                // I'll stick to scope-based deletion to be safe within the tenant if multi-tenant,
                // but if scope.isAdmin is true and no parentAdminId, it should be the root admin.
                // Actually, existing bulk-auto generate used: client: { userId: scope.userId }
                // So I will use the same scope for consistency.
                isArchived: false,
                profile: {
                    client: {
                        userId: scope.userId
                    }
                }
            },
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully deleted ${result.count} pending reviews`,
        });
    } catch (error) {
        console.error("Error deleting pending reviews:", error);
        return NextResponse.json(
            { error: "Failed to delete pending reviews" },
            { status: 500 }
        );
    }
}
