/**
 * GET /api/profiles/:id/qr
 * Generate QR code for a GMB profile's review link
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png"; // png | svg | base64

    const profile = await prisma.gmbProfile.findFirst({
        where: { id },
        select: {
            id: true,
            businessName: true,
            gmbLink: true,
            client: { select: { userId: true } },
        },
    });

    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Workers and admins can access
    const isAdmin = session.user.role === "ADMIN";
    const isWorker = session.user.role === "WORKER";
    const isOwner = isAdmin && profile.client.userId === session.user.id;

    if (!isOwner && !isWorker) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!profile.gmbLink) {
        return NextResponse.json({ error: "Profile has no GMB link set" }, { status: 400 });
    }

    try {
        if (format === "svg") {
            const svg = await QRCode.toString(profile.gmbLink, {
                type: "svg",
                width: 300,
                margin: 2,
                color: {
                    dark: "#0f172a",
                    light: "#ffffff",
                },
            });
            return new NextResponse(svg, {
                headers: {
                    "Content-Type": "image/svg+xml",
                    "Content-Disposition": `attachment; filename="${profile.businessName}-qr.svg"`,
                },
            });
        } else if (format === "base64") {
            const base64 = await QRCode.toDataURL(profile.gmbLink, {
                width: 400,
                margin: 2,
                color: {
                    dark: "#0f172a",
                    light: "#ffffff",
                },
            });
            return NextResponse.json({ qr: base64, businessName: profile.businessName, link: profile.gmbLink });
        } else {
            // PNG buffer
            const buffer = await QRCode.toBuffer(profile.gmbLink, {
                width: 400,
                margin: 2,
                color: {
                    dark: "#0f172a",
                    light: "#ffffff",
                },
            });
            return new NextResponse(buffer as unknown as BodyInit, {
                headers: {
                    "Content-Type": "image/png",
                    "Content-Disposition": `attachment; filename="${profile.businessName}-qr.png"`,
                },
            });
        }
    } catch (error) {
        console.error("QR generation error:", error);
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }
}
