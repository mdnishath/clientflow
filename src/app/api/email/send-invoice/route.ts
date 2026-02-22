/**
 * POST /api/email/send-invoice
 * Send invoice by email with PDF attachment
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, invoiceEmailTemplate, isEmailConfigured } from "@/lib/email";
import { generateInvoicePDF } from "@/lib/pdf-generator";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
        }

        if (!isEmailConfigured()) {
            return NextResponse.json({ error: "Email not configured. Please set SMTP credentials in Settings." }, { status: 503 });
        }

        // Fetch admin info for PDF
        const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true },
        });

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                client: { select: { name: true, email: true } },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        if (!invoice.client.email) {
            return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
        }

        const items = invoice.items as Array<{ description: string; quantity: number; rate: number }>;

        // Generate PDF attachment
        let pdfBuffer: Buffer | null = null;
        try {
            pdfBuffer = await generateInvoicePDF(invoice, {
                name: adminUser?.name || "Admin",
                email: adminUser?.email || session.user.email || "",
            });
        } catch (pdfErr) {
            console.error("[Invoice Email] PDF generation failed:", pdfErr);
            // Continue without PDF if generation fails
        }

        const template = invoiceEmailTemplate({
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            currency: invoice.currency,
            dueDate: new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            invoiceLink: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/finance`,
            items: items.map(i => ({ description: i.description, amount: i.quantity * i.rate })),
        });

        const result = await sendEmail({
            to: invoice.client.email,
            subject: template.subject,
            html: template.html,
            attachments: pdfBuffer ? [
                {
                    filename: `Invoice-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                }
            ] : undefined,
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
        }

        // Update invoice status to SENT if it was DRAFT
        if (invoice.status === "DRAFT") {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: "SENT" },
            });
        }

        return NextResponse.json({
            success: true,
            message: `Invoice sent to ${invoice.client.email}${pdfBuffer ? " with PDF attachment" : ""}`,
        });
    } catch (error) {
        console.error("Send invoice error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
