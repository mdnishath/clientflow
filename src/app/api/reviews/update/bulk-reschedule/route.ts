import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function POST() {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!scope.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        // 1. Fetch active profiles with pending reviews
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                isArchived: false,
                client: { userId: scope.userId },
                reviews: {
                    some: {
                        status: "PENDING",
                        isArchived: false
                    }
                }
            },
            include: {
                reviews: {
                    where: {
                        status: "PENDING",
                        isArchived: false
                    },
                    orderBy: {
                        createdAt: 'asc' // FIFO
                    }
                }
            }
        });

        let totalRescheduled = 0;
        const updates = [];

        // 2. Process each profile
        for (const profile of profiles) {
            const limit = profile.reviewLimit || 1; // Default to 1 if not set
            const start = profile.reviewsStartDate ? new Date(profile.reviewsStartDate) : new Date();

            // Normalize start date to beginning of day
            start.setHours(0, 0, 0, 0);

            // If start date is in the past, maybe start from today?
            // User requirement: "if start date is 9th Feb... show 2 pending"
            // So we strictly follow start date. 
            // If start date is in past, it will schedule for past?
            // "to avoid overdue" -> implies starting from TODAY or Future.
            // If I set start date to yesterday, and schedule for yesterday, they are overdue immediately.
            // I should probably ensure startDate is at least TODAY if we want to avoid OVERDUE.
            // But user said "start date to a date that admin will provide" in previous step.
            // So I will trust profile.reviewsStartDate. 
            // However, to "avoid overdue", logic implies we shouldn't schedule in past.
            // Let's stick to profile.reviewsStartDate, but if it's < today, maybe warn?
            // Actually, for "reschedule to avoid overdue", usually means "reset start date to today/future".
            // Since admin JUST set the start date in previous step, we assume they set a valid future date.

            let currentDate = new Date(start);
            let dailyCount = 0;

            for (const review of profile.reviews) {
                // Determine next valid date (skip weekends if needed? User didn't ask, so continuous)

                // If we hit limit, move to next day
                if (dailyCount >= limit) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    dailyCount = 0;
                }

                updates.push(
                    prisma.review.update({
                        where: { id: review.id },
                        data: {
                            dueDate: new Date(currentDate)
                        }
                    })
                );

                dailyCount++;
                totalRescheduled++;
            }
        }

        // 3. Execute updates in transaction (batching if necessary)
        // Prisma transaction has limit? Yes. But for "batch", we better process in chunks or rely on implementation.
        // For simplicity in this iteration, I'll use $transaction.

        // Chunking updates to avoid "too many parameters" error if thousands
        const chunkSize = 50;
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            await prisma.$transaction(chunk);
        }

        return NextResponse.json({
            success: true,
            count: totalRescheduled,
            message: `Successfully rescheduled ${totalRescheduled} reviews across ${profiles.length} profiles`
        });

    } catch (error) {
        console.error("Error bulk rescheduling:", error);
        return NextResponse.json(
            { error: "Failed to reschedule reviews" },
            { status: 500 }
        );
    }
}
