/**
 * Audit Log Utility
 * Records user actions for security and accountability
 */

import { prisma } from "@/lib/prisma";

export type AuditAction =
    | "LOGIN" | "LOGOUT"
    | "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "RESTORE"
    | "EXPORT" | "IMPORT"
    | "SALARY_PAID" | "INVOICE_SENT" | "PAYMENT_RECORDED"
    | "WORKER_CREATED" | "CLIENT_CREATED"
    | "BATCH_CHECK_STARTED" | "BATCH_CHECK_STOPPED"
    | "PASSWORD_CHANGED" | "SETTINGS_UPDATED";

export type AuditEntity =
    | "review" | "profile" | "client" | "worker" | "user"
    | "invoice" | "salary" | "payment"
    | "template" | "category" | "context"
    | "automation" | "settings";

interface CreateAuditLogOptions {
    userId: string;
    action: AuditAction | string;
    entity: AuditEntity | string;
    entityId?: string;
    detail?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

/**
 * Create an audit log entry (fire-and-forget, never throws)
 */
export async function createAuditLog(opts: CreateAuditLogOptions): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: opts.userId,
                action: opts.action,
                entity: opts.entity,
                entityId: opts.entityId,
                detail: opts.detail,
                metadata: opts.metadata,
                ipAddress: opts.ipAddress,
            },
        });
    } catch (error) {
        // Never throw — audit log failures should not break the main flow
        console.warn("[AuditLog] Failed to create log:", error);
    }
}

/**
 * Get recent audit logs for a user (admin view)
 */
export async function getAuditLogs(opts: {
    adminId: string;
    limit?: number;
    offset?: number;
    entity?: string;
    action?: string;
    userId?: string;
}) {
    const where: any = {
        user: {
            OR: [
                { id: opts.adminId },
                { parentAdminId: opts.adminId },
            ],
        },
    };

    if (opts.entity) where.entity = opts.entity;
    if (opts.action) where.action = opts.action;
    if (opts.userId) where.userId = opts.userId;

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
            take: opts.limit || 50,
            skip: opts.offset || 0,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
}
