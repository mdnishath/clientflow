/**
 * POST /api/clients/:id/report-token
 * Generate or regenerate a shareable report token
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const client = await prisma.client.findFirst({
        where: { id, userId: session.user.id },
        select: { id: true, reportToken: true },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const token = randomBytes(20).toString("hex");
    await prisma.client.update({ where: { id }, data: { reportToken: token } });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.json({ token, url: `${baseUrl}/report/${token}` });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.client.updateMany({
        where: { id, userId: session.user.id },
        data: { reportToken: null },
    });
    return NextResponse.json({ success: true });
}
