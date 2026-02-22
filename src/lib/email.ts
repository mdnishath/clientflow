/**
 * Email Service - Nodemailer SMTP
 * Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
 */

import nodemailer from "nodemailer";

// Create transporter (lazy-initialized)
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_PORT === "465",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    return transporter;
}

export interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    attachments?: EmailAttachment[];
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    if (!isEmailConfigured()) {
        console.warn("[Email] SMTP not configured. Set SMTP_USER and SMTP_PASS in .env");
        return { success: false, error: "Email not configured" };
    }

    try {
        const t = getTransporter();
        await t.sendMail({
            from: process.env.SMTP_FROM || "ClientFlow <noreply@client-flow.xyz>",
            to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]+>/g, ""),
            replyTo: options.replyTo,
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            })),
        });
        return { success: true };
    } catch (error: any) {
        console.error("[Email] Send failed:", error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px; text-align: center; }
  .header h1 { color: white; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .header p { color: rgba(255,255,255,0.8); font-size: 14px; }
  .body { padding: 32px; }
  .body p { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 0; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .info-box p { margin: 0; color: #64748b; font-size: 14px; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .info-row:last-child { border-bottom: none; }
  .info-row .label { color: #94a3b8; }
  .info-row .value { color: #0f172a; font-weight: 500; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-yellow { background: #fef9c3; color: #854d0e; }
  .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
  .footer p { color: #94a3b8; font-size: 12px; line-height: 1.6; }
  .divider { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>ClientFlow</h1>
      <p>Review Management Platform</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent by ClientFlow Review Manager.<br>
      Please do not reply to this email directly.</p>
    </div>
  </div>
</div>
</body>
</html>
`;

// Review Request Email (for clients to send to their customers)
export function reviewRequestTemplate(opts: {
    customerName?: string;
    businessName: string;
    gmbLink: string;
    reviewerNote?: string;
}) {
    const content = `
    <p>Hi ${opts.customerName ? opts.customerName : "there"},</p>
    <p>Thank you for choosing <strong>${opts.businessName}</strong>! We hope you had a great experience with us.</p>
    ${opts.reviewerNote ? `<p>${opts.reviewerNote}</p>` : ""}
    <p>We'd love to hear your feedback. Would you mind leaving us a quick review on Google? It only takes a minute and helps us serve you better.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${opts.gmbLink}" class="btn">⭐ Leave a Review on Google</a>
    </div>
    <div class="info-box">
      <p>💡 <strong>Tip:</strong> Share your honest experience — it helps other customers and supports our small business!</p>
    </div>
    <p>Thank you so much for your support. 🙏</p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Best regards,<br><strong>${opts.businessName}</strong> Team</p>
    `;
    return {
        subject: `Could you leave us a review? ⭐ — ${opts.businessName}`,
        html: baseTemplate(content, `Review Request — ${opts.businessName}`),
    };
}

// Invoice Email
export function invoiceEmailTemplate(opts: {
    clientName: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    dueDate: string;
    invoiceLink: string;
    items?: Array<{ description: string; amount: number }>;
}) {
    const itemsHtml = opts.items ? opts.items.map(item => `
    <div class="info-row">
      <span class="label">${item.description}</span>
      <span class="value">${opts.currency} ${item.amount.toFixed(2)}</span>
    </div>`).join('') : '';

    const content = `
    <p>Hello <strong>${opts.clientName}</strong>,</p>
    <p>Please find your invoice attached. Here's a summary:</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Invoice Number</span>
        <span class="value">${opts.invoiceNumber}</span>
      </div>
      <div class="info-row">
        <span class="label">Due Date</span>
        <span class="value">${opts.dueDate}</span>
      </div>
      ${itemsHtml}
      <div class="info-row" style="font-size: 15px;">
        <span class="label" style="font-weight: 700; color: #0f172a;">Total Amount</span>
        <span class="value" style="font-size: 18px; color: #6366f1; font-weight: 700;">${opts.currency} ${opts.amount.toFixed(2)}</span>
      </div>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${opts.invoiceLink}" class="btn">📄 View Invoice</a>
    </div>
    <p>Please complete the payment by <strong>${opts.dueDate}</strong>. If you have any questions, feel free to contact us.</p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Thank you for your business! 🙏</p>
    `;
    return {
        subject: `Invoice ${opts.invoiceNumber} — ${opts.currency} ${opts.amount.toFixed(2)} due ${opts.dueDate}`,
        html: baseTemplate(content, `Invoice ${opts.invoiceNumber}`),
    };
}

// Worker Welcome Email
export function workerWelcomeTemplate(opts: {
    workerName: string;
    email: string;
    password: string;
    loginUrl: string;
    adminName: string;
}) {
    const content = `
    <p>Hello <strong>${opts.workerName}</strong>,</p>
    <p>You've been added as a team member on ClientFlow by <strong>${opts.adminName}</strong>. Here are your login details:</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Login URL</span>
        <span class="value"><a href="${opts.loginUrl}" style="color: #6366f1;">${opts.loginUrl}</a></span>
      </div>
      <div class="info-row">
        <span class="label">Email</span>
        <span class="value">${opts.email}</span>
      </div>
      <div class="info-row">
        <span class="label">Password</span>
        <span class="value" style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${opts.password}</span>
      </div>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${opts.loginUrl}" class="btn">🚀 Login to ClientFlow</a>
    </div>
    <p style="color: #ef4444; font-size: 13px;">⚠️ Please change your password after your first login for security.</p>
    `;
    return {
        subject: `Welcome to ClientFlow — Your login details`,
        html: baseTemplate(content, `Welcome to ClientFlow`),
    };
}

// Client Welcome Email
export function clientWelcomeTemplate(opts: {
    clientName: string;
    email: string;
    password: string;
    loginUrl: string;
}) {
    const content = `
    <p>Hello <strong>${opts.clientName}</strong>,</p>
    <p>Your ClientFlow portal account has been created. You can now log in to view your review progress and reports.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Portal URL</span>
        <span class="value"><a href="${opts.loginUrl}" style="color: #6366f1;">${opts.loginUrl}</a></span>
      </div>
      <div class="info-row">
        <span class="label">Email</span>
        <span class="value">${opts.email}</span>
      </div>
      <div class="info-row">
        <span class="label">Password</span>
        <span class="value" style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${opts.password}</span>
      </div>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${opts.loginUrl}" class="btn">🔑 Access Your Portal</a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Please keep your login details secure.</p>
    `;
    return {
        subject: `Your ClientFlow portal access is ready`,
        html: baseTemplate(content, `ClientFlow Portal Access`),
    };
}

// Salary Payment Notification
export function salaryPaidTemplate(opts: {
    workerName: string;
    amount: number;
    currency: string;
    period: string;
    paymentMethod: string;
    notes?: string;
}) {
    const content = `
    <p>Hello <strong>${opts.workerName}</strong>,</p>
    <p>Your salary payment has been processed. Here are the details:</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Amount</span>
        <span class="value" style="color: #16a34a; font-weight: 700; font-size: 18px;">${opts.currency} ${opts.amount.toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="label">Period</span>
        <span class="value">${opts.period}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment Method</span>
        <span class="value">${opts.paymentMethod}</span>
      </div>
      <div class="info-row">
        <span class="label">Status</span>
        <span class="value"><span class="badge badge-green">✓ Paid</span></span>
      </div>
    </div>
    ${opts.notes ? `<div class="info-box"><p>📝 <strong>Note:</strong> ${opts.notes}</p></div>` : ""}
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Thank you for your hard work! 🙌</p>
    `;
    return {
        subject: `✅ Salary Paid — ${opts.currency} ${opts.amount.toFixed(2)} for ${opts.period}`,
        html: baseTemplate(content, `Salary Payment Confirmation`),
    };
}
