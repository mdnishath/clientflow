/**
 * POST /api/email/send-welcome
 * Send welcome email to a worker or client with their login credentials
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, workerWelcomeTemplate, clientWelcomeTemplate, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isEmailConfigured()) {
        return NextResponse.json({ error: "Email not configured." }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { userId, type, tempPassword } = body;
        // type: "worker" | "client"

        if (!userId || !type || !tempPassword) {
            return NextResponse.json({ error: "userId, type, and tempPassword are required" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true },
        });

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

        if (type === "worker") {
            const worker = await prisma.user.findFirst({
                where: { id: userId, parentAdminId: session.user.id, role: "WORKER" },
                select: { name: true, email: true },
            });
            if (!worker || !worker.email) {
                return NextResponse.json({ error: "Worker not found" }, { status: 404 });
            }
            const template = workerWelcomeTemplate({
                workerName: worker.name || "Team Member",
                email: worker.email,
                password: tempPassword,
                loginUrl: baseUrl,
                adminName: admin?.name || "Admin",
            });
            const result = await sendEmail({ to: worker.email, subject: template.subject, html: template.html });
            if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
        } else if (type === "client") {
            const client = await prisma.client.findFirst({
                where: {
                    userAccount: { id: userId },
                    userId: session.user.id,
                },
                include: { userAccount: { select: { name: true, email: true } } },
            });
            if (!client || !client.userAccount?.email) {
                return NextResponse.json({ error: "Client not found" }, { status: 404 });
            }
            const template = clientWelcomeTemplate({
                clientName: client.name,
                email: client.userAccount.email,
                password: tempPassword,
                loginUrl: baseUrl,
            });
            const result = await sendEmail({ to: client.userAccount.email, subject: template.subject, html: template.html });
            if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Welcome email sent!" });
    } catch (error) {
        console.error("Send welcome email error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
