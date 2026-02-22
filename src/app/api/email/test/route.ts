/**
 * POST /api/email/test - Test SMTP configuration
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isEmailConfigured()) {
        return NextResponse.json({
            configured: false,
            error: "SMTP not configured. Set SMTP_USER and SMTP_PASS in your .env file."
        }, { status: 200 });
    }

    const body = await request.json().catch(() => ({}));
    const testEmail = body.email || session.user.email;

    const result = await sendEmail({
        to: testEmail,
        subject: "✅ ClientFlow Email Test",
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; background: #f8fafc; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 24px; font-weight: 700; line-height: 60px;">✓</span>
                    </div>
                    <h2 style="color: #0f172a; margin: 0;">Email Configuration Working!</h2>
                </div>
                <p style="color: #475569; text-align: center;">Your SMTP settings are configured correctly. ClientFlow can now send emails.</p>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">Sent from ClientFlow at ${new Date().toLocaleString()}</p>
            </div>
        `,
    });

    return NextResponse.json(result);
}
