/**
 * POST /api/email/send-report
 * Send client review report by email with PDF attachment
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { generateReportPDF } from "@/lib/pdf-generator";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { clientId } = body;

        if (!clientId) {
            return NextResponse.json({ error: "clientId is required" }, { status: 400 });
        }

        if (!isEmailConfigured()) {
            return NextResponse.json({ error: "Email not configured. Please set SMTP credentials in Settings." }, { status: 503 });
        }

        // Fetch client + profiles + reviews
        const client = await prisma.client.findFirst({
            where: { id: clientId, userId: session.user.id },
            include: {
                gmbProfiles: {
                    where: { isArchived: false },
                    include: {
                        reviews: {
                            where: { isArchived: false },
                            select: { status: true },
                        },
                        _count: { select: { reviews: true } },
                    },
                    take: 20,
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        if (!client.email) {
            return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
        }

        // Build report data
        const allReviews = client.gmbProfiles.flatMap((p: any) => p.reviews);
        const stats = {
            total: allReviews.length,
            live: allReviews.filter((r: any) => r.status === "LIVE").length,
            done: allReviews.filter((r: any) => r.status === "DONE").length,
            applied: allReviews.filter((r: any) => r.status === "APPLIED").length,
            pending: allReviews.filter((r: any) => r.status === "PENDING").length,
            missing: allReviews.filter((r: any) => r.status === "MISSING").length,
        };
        const completionRate = stats.total > 0
            ? Math.round(((stats.live + stats.done) / stats.total) * 100)
            : 0;

        const profiles = client.gmbProfiles.map((p: any) => ({
            businessName: p.businessName,
            category: p.category,
            reviewOrdered: p.reviewOrdered,
            liveCount: p.reviews.filter((r: any) => r.status === "LIVE" || r.status === "DONE").length,
            total: p._count.reviews,
        }));

        const reportData = {
            client: { name: client.name },
            stats,
            completionRate,
            profiles,
            generatedAt: new Date().toISOString(),
        };

        // Generate PDF
        let pdfBuffer: Buffer | null = null;
        try {
            pdfBuffer = await generateReportPDF(reportData);
        } catch (pdfErr) {
            console.error("[Report Email] PDF generation failed:", pdfErr);
        }

        // Build email HTML
        const html = buildReportEmailHTML(client.name, completionRate, stats, profiles);

        const result = await sendEmail({
            to: client.email,
            subject: `Review Report — ${client.name} | ClientFlow`,
            html,
            attachments: pdfBuffer ? [
                {
                    filename: `Review-Report-${client.name.replace(/\s+/g, "-")}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                }
            ] : undefined,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Report sent to ${client.email}${pdfBuffer ? " with PDF attachment" : ""}`,
        });
    } catch (error) {
        console.error("Send report error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function buildReportEmailHTML(
    clientName: string,
    completionRate: number,
    stats: Record<string, number>,
    profiles: Array<{ businessName: string; liveCount: number; total: number }>
): string {
    const rateColor = completionRate >= 80 ? "#4ade80" : completionRate >= 50 ? "#6366f1" : "#fbbf24";

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 36px 40px; }
  .brand { color: rgba(255,255,255,0.8); font-size: 13px; margin-bottom: 8px; }
  .title { color: #fff; font-size: 26px; font-weight: 700; margin: 0; }
  .sub { color: rgba(255,255,255,0.65); font-size: 13px; margin-top: 6px; }
  .body { background: #0f172a; padding: 32px 40px; }
  .rate-box { background: #1e293b; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px; }
  .rate-num { font-size: 52px; font-weight: 700; color: ${rateColor}; }
  .rate-label { color: #64748b; font-size: 13px; margin-top: 4px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat { background: #1e293b; border-radius: 8px; padding: 16px; text-align: center; }
  .stat-num { font-size: 22px; font-weight: 700; }
  .stat-label { color: #64748b; font-size: 11px; margin-top: 3px; }
  .section-title { color: #e2e8f0; font-size: 14px; font-weight: 600; margin: 0 0 12px; }
  .profile { background: #1e293b; border-radius: 8px; padding: 14px 18px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .profile-name { color: #f1f5f9; font-weight: 600; font-size: 13px; }
  .profile-pct { font-weight: 700; font-size: 14px; }
  .bar-bg { background: #334155; border-radius: 4px; height: 4px; margin-top: 8px; }
  .bar-fill { border-radius: 4px; height: 4px; }
  .footer { background: #020617; padding: 20px 40px; text-align: center; color: #475569; font-size: 11px; }
  .footer a { color: #6366f1; text-decoration: none; }
  .attach-note { background: #1e3a5f; border: 1px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; color: #93c5fd; font-size: 13px; }
  .attach-icon { font-size: 16px; margin-right: 8px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="brand">ClientFlow — Review Management</div>
    <h1 class="title">Your Review Report</h1>
    <div class="sub">${clientName}</div>
  </div>
  <div class="body">
    <div class="attach-note">
      <span class="attach-icon">📎</span>
      Your full report is attached as a PDF to this email.
    </div>
    <div class="rate-box">
      <div class="rate-num">${completionRate}%</div>
      <div class="rate-label">Overall Completion Rate</div>
      <div style="color:#94a3b8;font-size:12px;margin-top:6px;">${stats.live + stats.done} of ${stats.total} reviews completed</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-num" style="color:#4ade80">${stats.live}</div><div class="stat-label">Live</div></div>
      <div class="stat"><div class="stat-num" style="color:#34d399">${stats.done}</div><div class="stat-label">Done</div></div>
      <div class="stat"><div class="stat-num" style="color:#a78bfa">${stats.applied}</div><div class="stat-label">Applied</div></div>
      <div class="stat"><div class="stat-num" style="color:#94a3b8">${stats.pending}</div><div class="stat-label">Pending</div></div>
      <div class="stat"><div class="stat-num" style="color:#fbbf24">${stats.missing}</div><div class="stat-label">Missing</div></div>
      <div class="stat"><div class="stat-num" style="color:#60a5fa">${stats.total}</div><div class="stat-label">Total</div></div>
    </div>
    ${profiles.length > 0 ? `
    <p class="section-title">Business Locations</p>
    ${profiles.map(p => {
        const pct = p.total > 0 ? Math.round((p.liveCount / p.total) * 100) : 0;
        const pc = pct >= 80 ? "#4ade80" : pct >= 50 ? "#6366f1" : "#fbbf24";
        return `<div class="profile">
      <div>
        <div class="profile-name">${p.businessName}</div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${pc}"></div></div>
      </div>
      <div class="profile-pct" style="color:${pc}">${pct}%<div style="color:#64748b;font-size:10px;font-weight:400">${p.liveCount}/${p.total}</div></div>
    </div>`;
    }).join("")}` : ""}
  </div>
  <div class="footer">
    Powered by <a href="https://client-flow.xyz">ClientFlow</a> — Professional Review Management
  </div>
</div>
</body>
</html>`;
}
