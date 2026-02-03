import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Account update API - for users to update their own credentials
 * PATCH /api/account - Update password
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current password and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Get current user with password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { passwordHash: true },
        });

        if (!user?.passwordHash) {
            return NextResponse.json(
                { error: "Unable to verify current password" },
                { status: 400 }
            );
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword },
        });

        return NextResponse.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Account update error:", error);
        return NextResponse.json(
            { error: "Failed to update account" },
            { status: 500 }
        );
    }
}
