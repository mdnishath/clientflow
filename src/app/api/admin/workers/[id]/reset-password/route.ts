/**
 * Worker Password Reset API
 * Allows isolated admin to reset worker passwords
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Only ADMIN can reset passwords
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin only" },
                { status: 403 }
            );
        }

        const { id: workerId } = await params;
        const body = await request.json();
        const { newPassword } = body;

        // Validation
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Get worker and verify they exist and are a WORKER
        const worker = await prisma.user.findUnique({
            where: { id: workerId },
            select: { id: true, role: true, name: true },
        });

        if (!worker) {
            return NextResponse.json(
                { error: "Worker not found" },
                { status: 404 }
            );
        }

        if (worker.role !== "WORKER") {
            return NextResponse.json(
                { error: "User is not a worker" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update worker password
        await prisma.user.update({
            where: { id: workerId },
            data: { passwordHash: hashedPassword },
        });

        // Log the action (optional - could create an audit log)
        console.log(
            `[ADMIN ACTION] ${session.user.name} reset password for worker ${worker.name} (ID: ${workerId})`
        );

        return NextResponse.json({
            success: true,
            message: `Password reset successfully for ${worker.name}`,
        });
    } catch (error) {
        console.error("Worker password reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        );
    }
}
