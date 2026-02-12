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
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Generate HTML for PDF (we'll use a simple HTML template for now)
        // In a real implementation, you'd use a library like puppeteer or react-pdf
        const html = generateInvoiceHTML(invoice, user);

        logger.info(
            `Generated PDF for invoice ${invoice.invoiceNumber}`,
            { invoiceId: id },
            "finance"
        );

        // Return HTML with proper content type
        // In production, you would convert this to PDF using puppeteer or similar
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
            },
        });
    } catch (error) {
        logger.error("Failed to generate invoice PDF", error, "finance");
        return NextResponse.json(
            { error: "Failed to generate invoice PDF" },
            { status: 500 }
        );
    }
}

function generateInvoiceHTML(invoice: any, user: any): string {
    const items = invoice.items as any[];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }
        .invoice {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0ea5e9;
        }
        .company h1 { font-size: 32px; color: #0ea5e9; margin-bottom: 5px; }
        .company p { color: #64748b; font-size: 14px; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { font-size: 24px; color: #0f172a; margin-bottom: 10px; }
        .invoice-details p { color: #64748b; font-size: 14px; margin: 5px 0; }
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .party h3 { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 10px; }
        .party p { color: #0f172a; font-size: 14px; margin: 5px 0; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            color: #475569;
            text-transform: uppercase;
            font-weight: 600;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            color: #0f172a;
        }
        .text-right { text-align: right; }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals tr td {
            padding: 8px 12px;
            border: none;
        }
        .totals tr:last-child {
            border-top: 2px solid #0ea5e9;
            font-weight: bold;
            font-size: 18px;
        }
        .notes {
            margin-top: 40px;
            padding: 20px;
            background: #f8fafc;
            border-left: 4px solid #0ea5e9;
        }
        .notes h3 { font-size: 14px; color: #475569; margin-bottom: 10px; }
        .notes p { color: #64748b; font-size: 14px; line-height: 1.6; }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status.draft { background: #f1f5f9; color: #475569; }
        .status.sent { background: #dbeafe; color: #1e40af; }
        .status.paid { background: #dcfce7; color: #166534; }
        .status.overdue { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="company">
                <h1>ClientFlow</h1>
                <p>${user.name || 'Admin'}</p>
                <p>${user.email}</p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>${invoice.invoiceNumber}</strong></p>
                <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                ${invoice.dueDate ? `<p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
                <p><span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span></p>
            </div>
        </div>

        <div class="parties">
            <div class="party">
                <h3>Bill To</h3>
                <p><strong>${invoice.client.name}</strong></p>
                <p>${invoice.client.email}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Rate</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>
                            <strong>${item.description}</strong>
                            ${item.details ? `<br><small style="color: #64748b;">${item.details}</small>` : ''}
                        </td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${invoice.currency} ${item.rate.toFixed(2)}</td>
                        <td class="text-right">${invoice.currency} ${(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <table class="totals">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">${invoice.currency} ${(invoice.amount || 0).toFixed(2)}</td>
            </tr>
            ${(invoice.tax || 0) > 0 ? `
                <tr>
                    <td>Tax</td>
                    <td class="text-right">${invoice.currency} ${(invoice.tax || 0).toFixed(2)}</td>
                </tr>
            ` : ''}
            ${(invoice.discount || 0) > 0 ? `
                <tr>
                    <td>Discount</td>
                    <td class="text-right">-${invoice.currency} ${(invoice.discount || 0).toFixed(2)}</td>
                </tr>
            ` : ''}
            <tr>
                <td>Total</td>
                <td class="text-right">${invoice.currency} ${invoice.totalAmount.toFixed(2)}</td>
            </tr>
        </table>

        ${invoice.notes ? `
            <div class="notes">
                <h3>Notes</h3>
                <p>${invoice.notes}</p>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated by ClientFlow on ${new Date().toLocaleDateString()}</p>
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}
