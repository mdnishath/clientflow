/**
 * POST /api/report/:token/email
 * Send report PDF to client email using the report token (no auth needed — token IS the auth)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { generateReportPDF } from "@/lib/pdf-generator";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    if (!token || token.length < 10) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (!isEmailConfigured()) {
        return NextResponse.json({ error: "Email not configured on this server" }, { status: 503 });
    }

    const client = await prisma.client.findUnique({
        where: { reportToken: token },
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
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (!client.email) {
        return NextResponse.json({ error: "Client has no email address on file" }, { status: 400 });
    }

    // Build stats
    const allReviews = client.gmbProfiles.flatMap((p: any) => p.reviews);
    const stats = {
        total:   allReviews.length,
        live:    allReviews.filter((r: any) => r.status === "LIVE").length,
        done:    allReviews.filter((r: any) => r.status === "DONE").length,
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
        stats, completionRate, profiles,
        generatedAt: new Date().toISOString(),
    };

    // Generate PDF
    let pdfBuffer: Buffer | null = null;
    try {
        pdfBuffer = await generateReportPDF(reportData);
    } catch (err) {
        console.error("[Report Token Email] PDF failed:", err);
    }

    // Build email HTML (same as send-report route)
    const rateColor = completionRate >= 80 ? "#4ade80" : completionRate >= 50 ? "#6366f1" : "#fbbf24";
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
body{margin:0;padding:0;background:#020617;font-family:-apple-system,sans-serif;}
.wrap{max-width:600px;margin:0 auto;}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;}
.title{color:#fff;font-size:24px;font-weight:700;margin:0;}
.sub{color:rgba(255,255,255,0.65);font-size:13px;margin-top:6px;}
.body{background:#0f172a;padding:32px 40px;}
.rate{background:#1e293b;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;}
.rate-num{font-size:52px;font-weight:700;color:${rateColor};}
.stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;}
.stat{background:#1e293b;border-radius:8px;padding:14px;text-align:center;}
.sn{font-size:22px;font-weight:700;}
.sl{color:#64748b;font-size:11px;margin-top:3px;}
.note{background:#1e3a5f;border:1px solid #3b82f6;border-radius:8px;padding:14px;margin-bottom:24px;color:#93c5fd;font-size:13px;}
.footer{background:#020617;padding:20px 40px;text-align:center;color:#475569;font-size:11px;}
.footer a{color:#6366f1;}
</style></head>
<body><div class="wrap">
<div class="header">
  <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-bottom:6px">ClientFlow — Review Report</div>
  <h1 class="title">Your Review Report</h1>
  <div class="sub">${client.name}</div>
</div>
<div class="body">
  <div class="note">📎 Full report attached as PDF</div>
  <div class="rate">
    <div class="rate-num">${completionRate}%</div>
    <div style="color:#64748b;font-size:12px;margin-top:4px;">Overall Completion</div>
    <div style="color:#94a3b8;font-size:12px;margin-top:4px;">${stats.live + stats.done} of ${stats.total} reviews completed</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="sn" style="color:#4ade80">${stats.live}</div><div class="sl">Live</div></div>
    <div class="stat"><div class="sn" style="color:#34d399">${stats.done}</div><div class="sl">Done</div></div>
    <div class="stat"><div class="sn" style="color:#94a3b8">${stats.pending}</div><div class="sl">Pending</div></div>
    <div class="stat"><div class="sn" style="color:#a78bfa">${stats.applied}</div><div class="sl">Applied</div></div>
    <div class="stat"><div class="sn" style="color:#fbbf24">${stats.missing}</div><div class="sl">Missing</div></div>
    <div class="stat"><div class="sn" style="color:#60a5fa">${stats.total}</div><div class="sl">Total</div></div>
  </div>
</div>
<div class="footer">Powered by <a href="https://client-flow.xyz">ClientFlow</a></div>
</div></body></html>`;

    const result = await sendEmail({
        to: client.email,
        subject: `Review Report — ${client.name} | ClientFlow`,
        html,
        attachments: pdfBuffer ? [{
            filename: `Review-Report-${client.name.replace(/\s+/g, "-")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
        }] : undefined,
    });

    if (!result.success) {
        return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `Report sent to ${client.email}${pdfBuffer ? " with PDF" : ""}`,
    });
}
