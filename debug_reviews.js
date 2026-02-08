const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviewData() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log("=== CHECKING ALL REVIEWS ===");
        console.log("Today:", today.toISOString());
        console.log("Tomorrow:", tomorrow.toISOString());
        console.log("");

        // Get all non-archived reviews
        const reviews = await prisma.review.findMany({
            where: {
                isArchived: false
            },
            select: {
                id: true,
                status: true,
                dueDate: true,
                profile: {
                    select: {
                        businessName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        console.log(`Total reviews found: ${reviews.length}\n`);

        let liveCount = 0;
        let pendingCount = 0;
        let liveTodayCount = 0;
        let pendingTodayCount = 0;

        reviews.forEach(r => {
            const isDueToday = r.dueDate && new Date(r.dueDate) >= today && new Date(r.dueDate) < tomorrow;
            const marker = isDueToday ? "✓ DUE TODAY" : "  ";

            console.log(`${marker} ${r.status.padEnd(12)} | Due: ${r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : 'NULL'.padEnd(10)} | ${r.profile.businessName}`);

            if (r.status === 'LIVE') {
                liveCount++;
                if (isDueToday) liveTodayCount++;
            }
            if (r.status === 'PENDING') {
                pendingCount++;
                if (isDueToday) pendingTodayCount++;
            }
        });

        console.log("\n=== SUMMARY ===");
        console.log(`Total LIVE: ${liveCount} (${liveTodayCount} due today)`);
        console.log(`Total PENDING: ${pendingCount} (${pendingTodayCount} due today)`);
        console.log(`\nProgress calculation: ${liveTodayCount} / ${pendingTodayCount + liveTodayCount} = ${pendingTodayCount + liveTodayCount > 0 ? Math.round((liveTodayCount / (pendingTodayCount + liveTodayCount)) * 100) : 0}%`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviewData();
