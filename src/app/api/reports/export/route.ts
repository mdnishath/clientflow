import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";
import { format, subDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import ExcelJS from "exceljs";

export async function GET(request: NextRequest) {
    try {
        const scope = await getClientScope();
        if (!scope) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const clientIdScope = !scope.isAdmin ? scope.clientId : null;

        const searchParams = request.nextUrl.searchParams;
        const exportFormat = searchParams.get("format") || "xlsx";
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const clientId = searchParams.get("clientId");
        const category = searchParams.get("category");
        const status = searchParams.get("status");

        // Debug log
        console.log("Export filters received:", { from, to, clientId, category, status, clientIdScope });

        // Build query
        const startDate = from ? new Date(from) : subDays(new Date(), 30);
        const endDate = to ? new Date(to) : new Date();

        const where: any = {
            isArchived: false,
            createdAt: {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate),
            },
        };

        // Apply scope-based filtering
        if (clientIdScope) {
            // Client sees only their reviews
            where.profile = { clientId: clientIdScope };
        } else {
            // Admin sees their own reviews (or managed reviews)
            where.userId = scope.userId;
        }

        // Add status filter if provided
        if (status && status !== "all") {
            where.status = status;
        }

        // Add nested profile filters if provided (Safe Merge)
        if ((clientId && clientId !== "all") || (category && category !== "all")) {
            where.profile = where.profile || {};

            if (clientId && clientId !== "all") {
                // Ensure Admin or matching client
                if (!clientIdScope || clientId === clientIdScope) {
                    where.profile.clientId = clientId;
                }
            }
            if (category && category !== "all") {
                where.profile.category = category;
            }
        }

        // Debug log
        console.log("Where clause built:", JSON.stringify(where, null, 2));

        // Fetch reviews
        const reviews = await prisma.review.findMany({
            where,
            include: {
                profile: {
                    include: {
                        client: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Debug log
        console.log(`Fetched ${reviews.length} reviews after filtering`);

        // Calculate detailed stats
        const totalReviews = reviews.length;
        const liveReviews = reviews.filter((r) => r.status === "LIVE" || r.status === "DONE").length;
        const pendingReviews = reviews.filter((r) => r.status === "PENDING").length;
        const inProgressReviews = reviews.filter((r) => r.status === "IN_PROGRESS").length;
        const appliedReviews = reviews.filter((r) => r.status === "APPLIED").length;
        const issueReviews = reviews.filter((r) => r.status === "MISSING" || r.status === "GOOGLE_ISSUE").length;
        const successRate = totalReviews > 0 ? Math.round((liveReviews / totalReviews) * 100) : 0;

        // Average completion time
        const completedReviews = reviews.filter(r => r.status === "LIVE" || r.status === "DONE");
        let avgCompletionDays = 0;
        if (completedReviews.length > 0) {
            const totalDays = completedReviews.reduce((sum, r) => {
                return sum + differenceInDays(r.updatedAt, r.createdAt);
            }, 0);
            avgCompletionDays = Math.round(totalDays / completedReviews.length);
        }

        // Client performance
        const clientStats: Record<string, { name: string, total: number, live: number }> = {};
        reviews.forEach((r) => {
            const cName = r.profile.client.name;
            if (!clientStats[cName]) clientStats[cName] = { name: cName, total: 0, live: 0 };
            clientStats[cName].total++;
            if (r.status === "LIVE" || r.status === "DONE") {
                clientStats[cName].live++;
            }
        });

        const topClients = Object.values(clientStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const statusCounts: Record<string, number> = {};
        reviews.forEach((r) => {
            statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        });

        if (exportFormat === "xlsx") {
            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = "ClientFlow Analytics";
            workbook.created = new Date();

            // Summary Sheet
            const summarySheet = workbook.addWorksheet("Summary");
            summarySheet.columns = [
                { header: "Metric", key: "metric", width: 25 },
                { header: "Value", key: "value", width: 20 },
            ];

            summarySheet.addRows([
                { metric: "Report Period", value: `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}` },
                { metric: "Generated", value: format(new Date(), "MMM d, yyyy HH:mm") },
                { metric: "", value: "" },
                { metric: "Total Reviews", value: totalReviews },
                { metric: "Live/Done Reviews", value: liveReviews },
                { metric: "Success Rate", value: `${successRate}%` },
                { metric: "Avg. Completion Time", value: `${avgCompletionDays} days` },
                { metric: "", value: "" },
                { metric: "Status Breakdown", value: "" },
                ...Object.entries(statusCounts).map(([status, count]) => ({
                    metric: status.replace(/_/g, " "),
                    value: count,
                })),
            ]);

            summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
            summarySheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF6366F1" },
            };

            // Reviews Sheet
            const reviewsSheet = workbook.addWorksheet("Reviews");
            reviewsSheet.columns = [
                { header: "Business Name", key: "businessName", width: 30 },
                { header: "Client", key: "client", width: 20 },
                { header: "Category", key: "category", width: 15 },
                { header: "Status", key: "status", width: 15 },
                { header: "Review Link", key: "reviewLink", width: 50 },
                { header: "Review Text", key: "reviewText", width: 50 },
                { header: "Email Used", key: "emailUsed", width: 25 },
                { header: "Created", key: "createdAt", width: 15 },
                { header: "Due Date", key: "dueDate", width: 15 },
            ];

            reviews.forEach((review) => {
                reviewsSheet.addRow({
                    businessName: review.profile.businessName,
                    client: review.profile.client.name,
                    category: review.profile.category || "-",
                    status: review.status,
                    reviewLink: review.reviewLiveLink || "-",
                    reviewText: review.reviewText || "-",
                    emailUsed: review.emailUsed || "-",
                    createdAt: format(review.createdAt, "MMM d, yyyy"),
                    dueDate: review.dueDate ? format(review.dueDate, "MMM d, yyyy") : "-",
                });
            });

            reviewsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
            reviewsSheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF6366F1" },
            };

            // Client Performance Sheet
            const clientSheet = workbook.addWorksheet("Client Performance");
            clientSheet.columns = [
                { header: "Client", key: "client", width: 25 },
                { header: "Total Reviews", key: "total", width: 15 },
                { header: "Live Reviews", key: "live", width: 15 },
                { header: "Success Rate", key: "rate", width: 15 },
            ];

            topClients.forEach((client) => {
                const rate = client.total > 0 ? Math.round((client.live / client.total) * 100) : 0;
                clientSheet.addRow({
                    client: client.name,
                    total: client.total,
                    live: client.live,
                    rate: `${rate}%`,
                });
            });

            clientSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
            clientSheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF6366F1" },
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const filename = `ClientFlow_Report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}.xlsx`;

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        }

        // PDF Export - Expert Level Professional Report
        if (exportFormat === "pdf") {
            const reportDate = format(new Date(), "MMMM d, yyyy");
            const periodText = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

            // Build status rows HTML
            const statusRowsHtml = Object.entries(statusCounts)
                .map(([status, count]) => {
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    const statusColors: Record<string, string> = {
                        PENDING: "#64748b",
                        IN_PROGRESS: "#3b82f6",
                        APPLIED: "#a855f7",
                        MISSING: "#eab308",
                        GOOGLE_ISSUE: "#ef4444",
                        LIVE: "#22c55e",
                        DONE: "#10b981",
                    };
                    const color = statusColors[status] || "#64748b";
                    return `
                        <tr>
                            <td style="display:flex;align-items:center;gap:8px;">
                                <span style="width:12px;height:12px;border-radius:50%;background:${color};display:inline-block;"></span>
                                ${status.replace(/_/g, " ")}
                            </td>
                            <td>${count}</td>
                            <td>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="width:100px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
                                        <div style="width:${pct}%;height:100%;background:${color};"></div>
                                    </div>
                                    <span>${pct}%</span>
                                </div>
                            </td>
                        </tr>
                    `;
                })
                .join("");

            // Build client performance rows
            const clientRowsHtml = topClients
                .slice(0, 5)
                .map((client, i) => {
                    const rate = client.total > 0 ? Math.round((client.live / client.total) * 100) : 0;
                    const medalColors = ["#fbbf24", "#94a3b8", "#d97706", "#64748b", "#64748b"];
                    return `
                        <tr>
                            <td>
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <div style="width:28px;height:28px;border-radius:50%;background:${medalColors[i]};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">
                                        ${i + 1}
                                    </div>
                                    ${client.name}
                                </div>
                            </td>
                            <td style="text-align:center;">${client.total}</td>
                            <td style="text-align:center;">${client.live}</td>
                            <td style="text-align:center;">
                                <span style="padding:4px 12px;border-radius:20px;font-weight:600;font-size:12px;background:${rate >= 70 ? "#d1fae5" : rate >= 40 ? "#fef3c7" : "#fee2e2"};color:${rate >= 70 ? "#059669" : rate >= 40 ? "#d97706" : "#dc2626"};">
                                    ${rate}%
                                </span>
                            </td>
                        </tr>
                    `;
                })
                .join("");

            // Build reviews table rows (show all filtered reviews, up to 100)
            const reviewRowsHtml = reviews
                .slice(0, 100)
                .map((r) => {
                    const statusColors: Record<string, { bg: string; color: string }> = {
                        PENDING: { bg: "#f1f5f9", color: "#475569" },
                        IN_PROGRESS: { bg: "#dbeafe", color: "#1d4ed8" },
                        APPLIED: { bg: "#f3e8ff", color: "#7c3aed" },
                        MISSING: { bg: "#fef3c7", color: "#b45309" },
                        GOOGLE_ISSUE: { bg: "#fee2e2", color: "#dc2626" },
                        LIVE: { bg: "#d1fae5", color: "#059669" },
                        DONE: { bg: "#d1fae5", color: "#047857" },
                    };
                    const sc = statusColors[r.status] || { bg: "#f1f5f9", color: "#475569" };
                    // Use reviewLiveLink instead of gmbLink
                    const reviewLink = r.reviewLiveLink || null;
                    const emailUsed = r.emailUsed || "-";

                    return `
                        <tr>
                            <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.profile.businessName}</td>
                            <td>${r.profile.client.name}</td>
                            <td>
                                <span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:500;background:${sc.bg};color:${sc.color};">
                                    ${r.status.replace(/_/g, " ")}
                                </span>
                            </td>
                            <td style="font-size:12px;">
                                ${reviewLink
                            ? `<a href="${reviewLink}" target="_blank" style="color:#6366f1;text-decoration:none;font-weight:500;">View Review ↗</a>`
                            : '<span style="color:#94a3b8;">-</span>'
                        }
                            </td>
                            <td style="font-size:12px;">${emailUsed !== "-" ? `<a href="mailto:${emailUsed}" style="color:#6366f1;text-decoration:none;">${emailUsed}</a>` : '<span style="color:#94a3b8;">-</span>'}</td>
                            <td style="font-size:12px;color:#64748b;">${format(r.createdAt, "MMM d")}</td>
                        </tr>
                    `;
                })
                .join("");

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            background: #ffffff;
                            color: #1e293b;
                            line-height: 1.6;
                        }
                        
                        .report-container {
                            max-width: 900px;
                            margin: 0 auto;
                            padding: 48px;
                        }
                        
                        /* Header */
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 40px;
                            padding-bottom: 24px;
                            border-bottom: 2px solid #e2e8f0;
                        }
                        
                        .logo-section h1 {
                            font-size: 28px;
                            font-weight: 700;
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }
                        
                        .logo-section .subtitle {
                            color: #64748b;
                            font-size: 14px;
                            margin-top: 4px;
                        }
                        
                        .report-meta {
                            text-align: right;
                        }
                        
                        .report-meta .date {
                            font-size: 12px;
                            color: #64748b;
                        }
                        
                        .report-meta .period {
                            font-size: 14px;
                            font-weight: 600;
                            color: #1e293b;
                            margin-top: 4px;
                            background: #f1f5f9;
                            padding: 6px 12px;
                            border-radius: 6px;
                        }
                        
                        /* Executive Summary */
                        .executive-summary {
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            border-radius: 16px;
                            padding: 32px;
                            margin-bottom: 32px;
                            color: white;
                        }
                        
                        .executive-summary h2 {
                            font-size: 14px;
                            font-weight: 500;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            opacity: 0.9;
                            margin-bottom: 20px;
                        }
                        
                        .kpi-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 24px;
                        }
                        
                        .kpi-card {
                            text-align: center;
                        }
                        
                        .kpi-value {
                            font-size: 36px;
                            font-weight: 700;
                            line-height: 1;
                        }
                        
                        .kpi-label {
                            font-size: 12px;
                            opacity: 0.85;
                            margin-top: 8px;
                        }
                        
                        /* Section Title */
                        .section-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #1e293b;
                            margin-bottom: 16px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .section-title::before {
                            content: "";
                            width: 4px;
                            height: 20px;
                            background: #6366f1;
                            border-radius: 2px;
                        }
                        
                        /* Cards */
                        .card {
                            background: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 24px;
                            margin-bottom: 24px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        }
                        
                        /* Two Column Layout */
                        .two-column {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 24px;
                            margin-bottom: 24px;
                        }
                        
                        /* Tables */
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 13px;
                        }
                        
                        th {
                            text-align: left;
                            padding: 12px 16px;
                            background: #f8fafc;
                            color: #64748b;
                            font-weight: 600;
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-bottom: 1px solid #e2e8f0;
                        }
                        
                        td {
                            padding: 12px 16px;
                            border-bottom: 1px solid #f1f5f9;
                            color: #475569;
                        }
                        
                        tr:last-child td {
                            border-bottom: none;
                        }
                        
                        /* Footer */
                        .footer {
                            margin-top: 48px;
                            padding-top: 24px;
                            border-top: 1px solid #e2e8f0;
                            text-align: center;
                            color: #94a3b8;
                            font-size: 12px;
                        }
                        
                        .footer a {
                            color: #6366f1;
                            text-decoration: none;
                        }
                        
                        /* Print Styles */
                        @media print {
                            body { background: white; }
                            .report-container { padding: 24px; }
                            .card { box-shadow: none; border: 1px solid #e2e8f0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <!-- Header -->
                        <div class="header">
                            <div class="logo-section">
                                <h1>ClientFlow</h1>
                                <div class="subtitle">GMB Review Analytics Report</div>
                            </div>
                            <div class="report-meta">
                                <div class="date">Generated: ${reportDate}</div>
                                <div class="period">📅 ${periodText}</div>
                            </div>
                        </div>
                        
                        <!-- Executive Summary -->
                        <div class="executive-summary">
                            <h2>📊 Executive Summary</h2>
                            <div class="kpi-grid">
                                <div class="kpi-card">
                                    <div class="kpi-value">${totalReviews}</div>
                                    <div class="kpi-label">Total Reviews</div>
                                </div>
                                <div class="kpi-card">
                                    <div class="kpi-value">${successRate}%</div>
                                    <div class="kpi-label">Success Rate</div>
                                </div>
                                <div class="kpi-card">
                                    <div class="kpi-value">${liveReviews}</div>
                                    <div class="kpi-label">Live Reviews</div>
                                </div>
                                <div class="kpi-card">
                                    <div class="kpi-value">${avgCompletionDays}d</div>
                                    <div class="kpi-label">Avg. Time to Live</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Two Column: Status & Clients -->
                        <div class="two-column">
                            <!-- Status Breakdown -->
                            <div class="card">
                                <h3 class="section-title">Status Breakdown</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>Count</th>
                                            <th>Distribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${statusRowsHtml}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Top Clients -->
                            <div class="card">
                                <h3 class="section-title">Top Performers</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th style="text-align:center;">Total</th>
                                            <th style="text-align:center;">Live</th>
                                            <th style="text-align:center;">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${clientRowsHtml || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No client data</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Key Insights -->
                        <div class="card">
                            <h3 class="section-title">Key Insights</h3>
                            <table>
                                <tbody>
                                    <tr>
                                        <td style="width:200px;font-weight:500;color:#1e293b;">📈 Reviews Pending Action</td>
                                        <td>${pendingReviews + inProgressReviews} reviews need attention (${pendingReviews} pending, ${inProgressReviews} in progress)</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight:500;color:#1e293b;">⚠️ Reviews with Issues</td>
                                        <td>${issueReviews} reviews have MISSING or GOOGLE_ISSUE status</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight:500;color:#1e293b;">🚀 Applied & Waiting</td>
                                        <td>${appliedReviews} reviews are applied and waiting to go live</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Recent Reviews -->
                        <div class="card">
                            <h3 class="section-title">Review Details (${Math.min(reviews.length, 100)} of ${reviews.length})</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Business</th>
                                        <th>Client</th>
                                        <th>Status</th>
                                        <th>Live Review</th>
                                        <th>Email Used</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${reviewRowsHtml || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No reviews in this period</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <p>Generated by <a href="#">ClientFlow</a> • ${reportDate}</p>
                            <p style="margin-top:4px;">This report contains confidential business data.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const filename = `ClientFlow_Report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}.html`;

            return new NextResponse(htmlContent, {
                headers: {
                    "Content-Type": "text/html",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
