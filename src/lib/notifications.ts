import { prisma } from "@/lib/prisma";

type NotificationType = "info" | "success" | "warning" | "error";

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
}

/**
 * Create a notification for a user
 * Use this in API routes to trigger real notifications
 */
export async function createNotification({
    userId,
    title,
    message,
    type = "info",
    link,
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}

/**
 * Create multiple notifications at once
 */
export async function createBulkNotifications(
    notifications: CreateNotificationParams[]
) {
    try {
        const results = await prisma.notification.createMany({
            data: notifications.map((n) => ({
                userId: n.userId,
                title: n.title,
                message: n.message,
                type: n.type || "info",
                link: n.link,
            })),
        });
        return results;
    } catch (error) {
        console.error("Failed to create bulk notifications:", error);
        return null;
    }
}
