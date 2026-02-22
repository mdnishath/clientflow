/**
 * POST /api/admin/email-config
 * Save SMTP config to .env file (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { host, port, user, pass, from } = body;

        const envPath = join(process.cwd(), ".env");
        let envContent = readFileSync(envPath, "utf-8");

        // Update or add SMTP values
        const updates: Record<string, string> = {
            SMTP_HOST: host || "smtp.gmail.com",
            SMTP_PORT: port || "587",
            SMTP_USER: user || "",
            SMTP_PASS: pass || "",
            SMTP_FROM: from || `ClientFlow <noreply@client-flow.xyz>`,
        };

        for (const [key, value] of Object.entries(updates)) {
            const regex = new RegExp(`^${key}=.*$`, "m");
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}="${value}"`);
            } else {
                envContent += `\n${key}="${value}"`;
            }
        }

        writeFileSync(envPath, envContent, "utf-8");

        // Update process.env immediately (works for current process)
        process.env.SMTP_HOST = updates.SMTP_HOST;
        process.env.SMTP_PORT = updates.SMTP_PORT;
        process.env.SMTP_USER = updates.SMTP_USER;
        process.env.SMTP_PASS = updates.SMTP_PASS;
        process.env.SMTP_FROM = updates.SMTP_FROM;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email config save error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
