/**
 * Server-side PDF Generator using pdfkit
 * Uses system Liberation fonts to avoid pdfkit built-in font path issues
 */

import PDFDocument from "pdfkit";
import path from "path";

// System font paths (Liberation fonts — compatible with Helvetica/Arial)
const FONT_DIR = "/usr/share/fonts/truetype/liberation";
const FONT_REGULAR = path.join(FONT_DIR, "LiberationSans-Regular.ttf");
const FONT_BOLD    = path.join(FONT_DIR, "LiberationSans-Bold.ttf");

// Colors
const INDIGO      = "#6366f1";
const INDIGO_DARK = "#4f46e5";
const WHITE       = "#ffffff";
const SLATE_100   = "#f1f5f9";
const SLATE_300   = "#cbd5e1";
const SLATE_400   = "#94a3b8";
const SLATE_500   = "#64748b";
const SLATE_700   = "#334155";
const SLATE_800   = "#1e293b";
const SLATE_900   = "#0f172a";
const SLATE_950   = "#020617";
const GREEN       = "#4ade80";
const RED         = "#f87171";
const BLUE        = "#60a5fa";
const YELLOW      = "#fbbf24";

function statusColor(status: string): string {
    switch (status) {
        case "PAID":      return GREEN;
        case "SENT":      return BLUE;
        case "OVERDUE":   return RED;
        case "CANCELLED": return SLATE_500;
        default:          return SLATE_400;
    }
}

function makePDF(): InstanceType<typeof PDFDocument> {
    return new PDFDocument({
        margin: 0,
        size: "A4",
        // Disable built-in font loading to prevent path issues
        font: FONT_REGULAR,
    });
}

/** ── INVOICE PDF ── */
export function generateInvoicePDF(
    invoice: any,
    adminUser: { name: string; email: string }
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = makePDF();
            const chunks: Buffer[] = [];
            doc.on("data",  (c) => chunks.push(c));
            doc.on("end",   () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            const W = 595.28;
            const MARGIN = 48;
            const CW = W - MARGIN * 2;

            /* ── HEADER BAND ── */
            doc.rect(0, 0, W, 140).fill(INDIGO_DARK);

            // Brand box
            doc.roundedRect(MARGIN, 28, 36, 36, 6).fill("rgba(255,255,255,0.18)");
            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(13).text("CF", MARGIN + 9, 38);

            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(17).text("ClientFlow", MARGIN + 48, 30);
            doc.fillColor("rgba(255,255,255,0.65)").font(FONT_REGULAR).fontSize(9)
                .text(`${adminUser.name || "Admin"}  •  ${adminUser.email}`, MARGIN + 48, 51);

            // INVOICE label — right
            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(26)
                .text("INVOICE", 0, 28, { align: "right", width: W - MARGIN });
            doc.fillColor("rgba(255,255,255,0.7)").font(FONT_REGULAR).fontSize(10)
                .text(invoice.invoiceNumber, 0, 62, { align: "right", width: W - MARGIN });

            // Status chip
            const st = statusColor(invoice.status);
            doc.roundedRect(W - MARGIN - 68, 82, 68, 20, 10).fill("rgba(0,0,0,0.3)");
            doc.fillColor(st).font(FONT_BOLD).fontSize(8)
                .text(invoice.status, W - MARGIN - 68, 88, { align: "center", width: 68 });

            let y = 158;

            /* ── PARTIES ── */
            const hw = (CW - 14) / 2;

            drawBox(doc, MARGIN, y, hw, 76);
            doc.fillColor(INDIGO).font(FONT_BOLD).fontSize(7.5).text("BILL TO", MARGIN + 12, y + 12, { characterSpacing: 1.5 });
            doc.fillColor(SLATE_100).font(FONT_BOLD).fontSize(12).text(invoice.client.name, MARGIN + 12, y + 28);
            if (invoice.client.email)
                doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8.5).text(invoice.client.email, MARGIN + 12, y + 46);

            const fx = MARGIN + hw + 14;
            drawBox(doc, fx, y, hw, 76);
            doc.fillColor(INDIGO).font(FONT_BOLD).fontSize(7.5).text("FROM", fx + 12, y + 12, { characterSpacing: 1.5 });
            doc.fillColor(SLATE_100).font(FONT_BOLD).fontSize(12).text(adminUser.name || "Admin", fx + 12, y + 28);
            doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8.5).text(adminUser.email, fx + 12, y + 46);

            y += 90;

            /* ── DATE CARDS ── */
            const dates = [
                { label: "ISSUE DATE", val: fmtDate(invoice.createdAt) },
                { label: "DUE DATE",   val: invoice.dueDate ? fmtDate(invoice.dueDate) : "N/A" },
                { label: "CURRENCY",   val: invoice.currency || "USD" },
            ];
            const dw = (CW - 24) / 3;
            dates.forEach((d, i) => {
                const cx = MARGIN + i * (dw + 12);
                drawBox(doc, cx, y, dw, 48);
                doc.fillColor(SLATE_500).font(FONT_BOLD).fontSize(7)
                    .text(d.label, cx + 10, y + 10, { characterSpacing: 1, width: dw - 20, align: "center" });
                doc.fillColor(SLATE_100).font(FONT_BOLD).fontSize(10)
                    .text(d.val, cx + 10, y + 26, { width: dw - 20, align: "center" });
            });
            y += 62;

            /* ── ITEMS TABLE ── */
            // Header row
            doc.rect(MARGIN, y, CW, 30).fill(SLATE_800);
            const C = {
                desc: MARGIN + 12,
                qty:  MARGIN + CW - 210,
                rate: MARGIN + CW - 135,
                amt:  MARGIN + CW - 55,
            };
            doc.fillColor(SLATE_500).font(FONT_BOLD).fontSize(7.5);
            ["DESCRIPTION", "QTY", "RATE", "AMOUNT"].forEach((h, i) => {
                const x = [C.desc, C.qty, C.rate, C.amt][i];
                doc.text(h, x, y + 10, { characterSpacing: 0.8 });
            });
            y += 30;

            const items = invoice.items as Array<{ description: string; quantity: number; rate: number }>;
            items.forEach((item, idx) => {
                const rh = 34;
                doc.rect(MARGIN, y, CW, rh).fill(idx % 2 === 0 ? "#111827" : SLATE_900);
                const lineAmt = (item.quantity * item.rate).toFixed(2);
                doc.fillColor(SLATE_100).font(FONT_BOLD).fontSize(9.5).text(item.description, C.desc, y + 10, { width: 180 });
                doc.fillColor(SLATE_300).font(FONT_REGULAR).fontSize(9.5).text(String(item.quantity), C.qty, y + 10);
                doc.text(`${invoice.currency} ${Number(item.rate).toFixed(2)}`, C.rate, y + 10);
                doc.fillColor(WHITE).font(FONT_BOLD).fontSize(9.5).text(`${invoice.currency} ${lineAmt}`, C.amt, y + 10);
                y += rh;
            });

            doc.rect(MARGIN, y, CW, 0.5).fill(SLATE_700);
            y += 16;

            /* ── TOTALS ── */
            const tx = MARGIN + CW - 230;
            const tw = 230;
            const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
            const tax      = invoice.tax || 0;
            const discount = invoice.discount || 0;
            const total    = invoice.totalAmount ?? subtotal + tax - discount;

            const drawTRow = (label: string, val: string, isFinal = false) => {
                const rh = isFinal ? 38 : 28;
                if (isFinal) {
                    doc.rect(tx, y, tw, rh).fill(INDIGO_DARK);
                    doc.fillColor(WHITE).font(FONT_BOLD).fontSize(12);
                    doc.text(label, tx + 12, y + 12);
                    doc.text(val, tx + 12, y + 12, { width: tw - 24, align: "right" });
                } else {
                    drawBox(doc, tx, y, tw, rh);
                    doc.fillColor(SLATE_400).font(FONT_REGULAR).fontSize(9).text(label, tx + 12, y + 8);
                    doc.fillColor(SLATE_100).font(FONT_BOLD).fontSize(9).text(val, tx + 12, y + 8, { width: tw - 24, align: "right" });
                }
                y += rh;
            };

            drawTRow("Subtotal", `${invoice.currency} ${subtotal.toFixed(2)}`);
            if (tax > 0)      drawTRow("Tax",      `${invoice.currency} ${tax.toFixed(2)}`);
            if (discount > 0) drawTRow("Discount", `- ${invoice.currency} ${discount.toFixed(2)}`);
            drawTRow("TOTAL", `${invoice.currency} ${total.toFixed(2)}`, true);

            y += 20;

            /* ── NOTES ── */
            if (invoice.notes) {
                doc.rect(MARGIN, y, CW, 3).fill(INDIGO);
                y += 10;
                drawBox(doc, MARGIN, y, CW, 56);
                doc.fillColor(INDIGO).font(FONT_BOLD).fontSize(7.5).text("NOTES", MARGIN + 12, y + 12, { characterSpacing: 1.5 });
                doc.fillColor(SLATE_400).font(FONT_REGULAR).fontSize(9.5).text(invoice.notes, MARGIN + 12, y + 28, { width: CW - 24 });
                y += 66;
            }

            /* ── FOOTER ── */
            const PH = 841.89;
            doc.rect(0, PH - 44, W, 44).fill(SLATE_950);
            doc.fillColor(INDIGO).font(FONT_BOLD).fontSize(10).text("ClientFlow", MARGIN, PH - 28);
            doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8.5)
                .text(`Generated ${fmtDate(new Date())}  •  Thank you for your business!`,
                    0, PH - 28, { align: "right", width: W - MARGIN });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

/** ── REPORT PDF ── */
export function generateReportPDF(data: {
    client: { name: string };
    stats: { total: number; live: number; done: number; applied: number; pending: number; missing: number };
    completionRate: number;
    profiles: Array<{ businessName: string; category: string | null; liveCount: number; total: number }>;
    generatedAt: string;
}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = makePDF();
            const chunks: Buffer[] = [];
            doc.on("data",  (c) => chunks.push(c));
            doc.on("end",   () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            const W = 595.28;
            const MARGIN = 48;
            const CW = W - MARGIN * 2;

            /* ── HEADER ── */
            doc.rect(0, 0, W, 120).fill(INDIGO_DARK);
            doc.roundedRect(MARGIN, 24, 36, 36, 6).fill("rgba(255,255,255,0.18)");
            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(13).text("CF", MARGIN + 9, 34);
            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(17).text("ClientFlow", MARGIN + 48, 26);
            doc.fillColor("rgba(255,255,255,0.65)").font(FONT_REGULAR).fontSize(9).text("Review Management Report", MARGIN + 48, 48);
            doc.fillColor(WHITE).font(FONT_BOLD).fontSize(20)
                .text(data.client.name, 0, 30, { align: "right", width: W - MARGIN });
            doc.fillColor("rgba(255,255,255,0.65)").font(FONT_REGULAR).fontSize(9)
                .text(`Generated ${fmtDate(data.generatedAt)}`, 0, 56, { align: "right", width: W - MARGIN });

            let y = 138;

            /* ── COMPLETION RATE ── */
            const rate = data.completionRate;
            const rateCol = rate >= 80 ? GREEN : rate >= 50 ? INDIGO : YELLOW;
            drawBox(doc, MARGIN, y, CW, 80);
            doc.fillColor(rateCol).font(FONT_BOLD).fontSize(42)
                .text(`${rate}%`, 0, y + 14, { align: "center", width: W });
            doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(10)
                .text(`${data.stats.live + data.stats.done} of ${data.stats.total} reviews completed`, 0, y + 56, { align: "center", width: W });
            y += 96;

            /* ── STATS GRID ── */
            const statData = [
                { label: "Live",    val: data.stats.live,    color: GREEN   },
                { label: "Done",    val: data.stats.done,    color: "#34d399" },
                { label: "Applied", val: data.stats.applied, color: "#a78bfa" },
                { label: "Pending", val: data.stats.pending, color: SLATE_400 },
                { label: "Missing", val: data.stats.missing, color: YELLOW  },
                { label: "Total",   val: data.stats.total,   color: BLUE    },
            ];
            const sw = (CW - 40) / 3;
            statData.forEach((s, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const cx = MARGIN + col * (sw + 20);
                const cy = y + row * 68;
                drawBox(doc, cx, cy, sw, 56);
                doc.fillColor(s.color).font(FONT_BOLD).fontSize(24)
                    .text(String(s.val), cx + 10, cy + 10, { width: sw - 20, align: "center" });
                doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8.5)
                    .text(s.label, cx + 10, cy + 38, { width: sw - 20, align: "center" });
            });
            y += 152;

            /* ── PROFILES ── */
            if (data.profiles.length > 0) {
                doc.fillColor(WHITE).font(FONT_BOLD).fontSize(12).text("Business Locations", MARGIN, y);
                y += 22;

                data.profiles.forEach((p) => {
                    const pct = p.total > 0 ? Math.round((p.liveCount / p.total) * 100) : 0;
                    const pc = pct >= 80 ? GREEN : pct >= 50 ? INDIGO : YELLOW;

                    drawBox(doc, MARGIN, y, CW, 54);
                    doc.fillColor(WHITE).font(FONT_BOLD).fontSize(10.5)
                        .text(p.businessName, MARGIN + 12, y + 10, { width: CW - 80 });
                    if (p.category)
                        doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8).text(p.category, MARGIN + 12, y + 26);

                    // Pct right
                    doc.fillColor(pc).font(FONT_BOLD).fontSize(13)
                        .text(`${pct}%`, MARGIN + CW - 55, y + 10, { width: 43, align: "right" });
                    doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(7.5)
                        .text(`${p.liveCount}/${p.total}`, MARGIN + CW - 55, y + 28, { width: 43, align: "right" });

                    // Progress bar
                    doc.roundedRect(MARGIN + 12, y + 42, CW - 24, 4, 2).fill(SLATE_700);
                    if (pct > 0) {
                        const fw = Math.max(((CW - 24) * pct) / 100, 6);
                        doc.roundedRect(MARGIN + 12, y + 42, fw, 4, 2).fill(pc);
                    }
                    y += 66;
                });
            }

            /* ── FOOTER ── */
            const PH = 841.89;
            doc.rect(0, PH - 44, W, 44).fill(SLATE_950);
            doc.fillColor(INDIGO).font(FONT_BOLD).fontSize(10).text("ClientFlow", MARGIN, PH - 28);
            doc.fillColor(SLATE_500).font(FONT_REGULAR).fontSize(8.5)
                .text("Professional Review Management", 0, PH - 28, { align: "right", width: W - MARGIN });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

// ── Helpers ──
function drawBox(doc: any, x: number, y: number, w: number, h: number) {
    doc.roundedRect(x, y, w, h, 7).fill(SLATE_800);
    doc.roundedRect(x, y, w, h, 7).stroke(SLATE_700).lineWidth(0.4);
}

function fmtDate(d: string | Date | null | undefined): string {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
