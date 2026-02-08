import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function PATCH(req: Request) {
    try {
        const scope = await getClientScope();
        if (!scope?.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: scope.userId },
            data: { name: name.trim() },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
