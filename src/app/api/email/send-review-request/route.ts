/**
 * POST /api/email/send-review-request
 * Send a review request email to a customer for a specific GMB profile
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, reviewRequestTemplate, isEmailConfigured } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 emails per minute per user
    const ip = getClientIp(request);
    const rl = checkRateLimit(`email:review:${session.user.id}:${ip}`, 30, 60_000);
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many email requests. Please wait." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { profileId, customerEmail, customerName, customNote } = body;

        if (!profileId || !customerEmail) {
            return NextResponse.json({ error: "profileId and customerEmail are required" }, { status: 400 });
        }

        // Verify profile ownership
        const profile = await prisma.gmbProfile.findFirst({
            where: {
                id: profileId,
                client: { userId: session.user.id },
            },
            include: { client: { select: { name: true } } },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        if (!profile.gmbLink) {
            return NextResponse.json({ error: "Profile has no GMB link set" }, { status: 400 });
        }

        if (!isEmailConfigured()) {
            return NextResponse.json({ error: "Email not configured. Set SMTP_USER and SMTP_PASS in settings." }, { status: 503 });
        }

        const template = reviewRequestTemplate({
            customerName,
            businessName: profile.businessName,
            gmbLink: profile.gmbLink,
            reviewerNote: customNote,
        });

        const result = await sendEmail({
            to: customerEmail,
            subject: template.subject,
            html: template.html,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Review request sent!" });
    } catch (error) {
        console.error("Send review request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
