const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDueDates() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log("Updating all NULL due dates to today:", today.toISOString());

        const result = await prisma.review.updateMany({
            where: {
                dueDate: null,
                isArchived: false
            },
            data: {
                dueDate: today
            }
        });

        console.log(`✅ Updated ${result.count} reviews with today's due date`);

        // Verify
        const todayReviews = await prisma.review.findMany({
            where: {
                dueDate: { gte: today },
                isArchived: false
            },
            select: {
                id: true,
                status: true,
                dueDate: true,
                profile: { select: { businessName: true } }
            }
        });

        console.log(`\n📊 Reviews due today: ${todayReviews.length}`);
        todayReviews.forEach(r => {
            console.log(`  ${r.status.padEnd(12)} | ${r.profile.businessName}`);
        });

        const liveToday = todayReviews.filter(r => r.status === 'LIVE').length;
        const pendingToday = todayReviews.filter(r => r.status === 'PENDING').length;
        const totalToday = pendingToday + liveToday;

        console.log(`\n🎯 Progress: ${liveToday} LIVE / ${totalToday} total = ${totalToday > 0 ? Math.round((liveToday / totalToday) * 100) : 0}%`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixDueDates();
