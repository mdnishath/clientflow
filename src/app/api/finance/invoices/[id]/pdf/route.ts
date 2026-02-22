import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/finance/invoices/:id/pdf - Generate PDF invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, name: true, email: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        const { id } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        const html = generateInvoiceHTML(invoice, user);

        logger.info(`Generated PDF for invoice ${invoice.invoiceNumber}`, { invoiceId: id }, "finance");

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
            },
        });
    } catch (error) {
        logger.error("Failed to generate invoice PDF", error, "finance");
        return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
    }
}

function getStatusStyle(status: string): { bg: string; color: string; label: string } {
    switch (status) {
        case "PAID":      return { bg: "#052e16", color: "#4ade80", label: "PAID" };
        case "SENT":      return { bg: "#1e3a5f", color: "#60a5fa", label: "SENT" };
        case "OVERDUE":   return { bg: "#450a0a", color: "#f87171", label: "OVERDUE" };
        case "CANCELLED": return { bg: "#1c1917", color: "#78716c", label: "CANCELLED" };
        default:          return { bg: "#1e293b", color: "#94a3b8", label: "DRAFT" };
    }
}

function generateInvoiceHTML(invoice: any, user: any): string {
    const items = invoice.items as any[];
    const statusStyle = getStatusStyle(invoice.status);
    const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.rate, 0);
    const tax = invoice.tax || 0;
    const discount = invoice.discount || 0;
    const total = invoice.totalAmount ?? subtotal + tax - discount;

    const isOverdue = invoice.status !== "PAID" && invoice.dueDate && new Date(invoice.dueDate) < new Date();
    const displayStatus = isOverdue && invoice.status !== "PAID" ? "OVERDUE" : invoice.status;
    const ds = getStatusStyle(displayStatus);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${invoice.invoiceNumber} — ClientFlow</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #020617;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 40px 20px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    max-width: 820px;
    margin: 0 auto;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  }

  /* ── TOP GRADIENT BANNER ── */
  .banner {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%);
    padding: 36px 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
  }
  .banner::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
  .banner::after {
    content: '';
    position: absolute;
    bottom: -80px; left: 40px;
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%;
  }
  .brand {
    position: relative; z-index: 1;
  }
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .brand-icon {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
  }
  .brand-name {
    font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.3px;
  }
  .brand-meta { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }

  .invoice-label {
    position: relative; z-index: 1; text-align: right;
  }
  .invoice-word {
    font-size: 36px; font-weight: 700; color: #fff;
    letter-spacing: 4px; text-transform: uppercase; opacity: 0.9;
  }
  .invoice-num {
    font-size: 14px; color: rgba(255,255,255,0.75); margin-top: 4px;
    font-weight: 500; letter-spacing: 0.5px;
  }
  .status-chip {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    background: ${ds.bg};
    color: ${ds.color};
    border: 1px solid ${ds.color}40;
  }

  /* ── BODY ── */
  .body { padding: 40px 48px; }

  /* Parties row */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 36px;
  }
  .party-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 20px 24px;
  }
  .party-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 10px;
  }
  .party-name { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
  .party-email { font-size: 13px; color: #64748b; }

  /* Dates row */
  .dates-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 36px;
  }
  .date-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 16px 20px;
    text-align: center;
  }
  .date-card-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: #64748b; margin-bottom: 6px;
  }
  .date-card-value { font-size: 14px; font-weight: 600; color: #e2e8f0; }

  /* Items table */
  .table-wrap {
    border: 1px solid #1e293b;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #1e293b; }
  th {
    padding: 14px 18px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 1px; text-transform: uppercase;
    color: #64748b; text-align: left;
  }
  th:not(:first-child) { text-align: right; }
  tbody tr { border-top: 1px solid #1e293b; }
  tbody tr:nth-child(even) { background: #0f172a; }
  tbody tr:nth-child(odd) { background: #111827; }
  td { padding: 14px 18px; font-size: 14px; color: #cbd5e1; vertical-align: top; }
  td:not(:first-child) { text-align: right; }
  .td-desc { color: #f1f5f9; font-weight: 500; }
  .td-detail { color: #64748b; font-size: 12px; margin-top: 2px; }

  /* Totals */
  .totals-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 36px;
  }
  .totals-box {
    width: 320px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    overflow: hidden;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 20px;
    font-size: 14px;
    border-bottom: 1px solid #0f172a;
    color: #94a3b8;
  }
  .totals-row:last-child {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    border-bottom: none;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    padding: 16px 20px;
  }
  .totals-row span:last-child { font-weight: 600; color: #e2e8f0; }
  .totals-row:last-child span:last-child { color: #fff; }

  /* Notes */
  .notes-box {
    background: #1e293b;
    border: 1px solid #334155;
    border-left: 3px solid #6366f1;
    border-radius: 10px;
    padding: 18px 22px;
    margin-bottom: 36px;
  }
  .notes-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #6366f1; margin-bottom: 8px;
  }
  .notes-text { font-size: 14px; color: #94a3b8; line-height: 1.6; }

  /* Footer */
  .footer {
    background: #0a0f1e;
    border-top: 1px solid #1e293b;
    padding: 20px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-brand { font-size: 13px; font-weight: 600; color: #6366f1; }
  .footer-meta { font-size: 11px; color: #475569; }

  /* Print tweaks */
  @media print {
    body { background: #020617; padding: 0; }
    .page { border-radius: 0; box-shadow: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- BANNER -->
  <div class="banner">
    <div class="brand">
      <div class="brand-logo">
        <div class="brand-icon">CF</div>
        <span class="brand-name">ClientFlow</span>
      </div>
      <div class="brand-meta">${user.name || "Admin"} &nbsp;•&nbsp; ${user.email}</div>
    </div>
    <div class="invoice-label">
      <div class="invoice-word">Invoice</div>
      <div class="invoice-num">${invoice.invoiceNumber}</div>
      <div class="status-chip">${ds.label}</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- Parties -->
    <div class="parties">
      <div class="party-box">
        <div class="party-label">Bill To</div>
        <div class="party-name">${invoice.client.name}</div>
        ${invoice.client.email ? `<div class="party-email">${invoice.client.email}</div>` : ""}
      </div>
      <div class="party-box">
        <div class="party-label">From</div>
        <div class="party-name">${user.name || "Admin"}</div>
        <div class="party-email">${user.email}</div>
      </div>
    </div>

    <!-- Dates -->
    <div class="dates-row">
      <div class="date-card">
        <div class="date-card-label">Issue Date</div>
        <div class="date-card-value">${new Date(invoice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
      </div>
      ${invoice.dueDate ? `
      <div class="date-card">
        <div class="date-card-label">Due Date</div>
        <div class="date-card-value" style="${isOverdue ? "color:#f87171;" : ""}">${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
      </div>` : ""}
      <div class="date-card">
        <div class="date-card-label">Currency</div>
        <div class="date-card-value">${invoice.currency || "USD"}</div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
          <tr>
            <td>
              <div class="td-desc">${item.description}</div>
              ${item.details ? `<div class="td-detail">${item.details}</div>` : ""}
            </td>
            <td>${item.quantity}</td>
            <td>${invoice.currency} ${Number(item.rate).toFixed(2)}</td>
            <td>${invoice.currency} ${(item.quantity * item.rate).toFixed(2)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${invoice.currency} ${subtotal.toFixed(2)}</span>
        </div>
        ${tax > 0 ? `<div class="totals-row"><span>Tax</span><span>${invoice.currency} ${tax.toFixed(2)}</span></div>` : ""}
        ${discount > 0 ? `<div class="totals-row"><span>Discount</span><span>− ${invoice.currency} ${discount.toFixed(2)}</span></div>` : ""}
        <div class="totals-row">
          <span>Total</span>
          <span>${invoice.currency} ${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div class="notes-box">
      <div class="notes-label">Notes</div>
      <div class="notes-text">${invoice.notes}</div>
    </div>` : ""}

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <span class="footer-brand">ClientFlow</span>
    <span class="footer-meta">Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &nbsp;•&nbsp; Thank you for your business!</span>
  </div>

</div>
</body>
</html>`;
}
