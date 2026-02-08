const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStatsQuery() {
    try {
        // Simulate what the stats API does
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const startOfWindow = new Date(todayStart);
        const endOfWindow = new Date(todayStart);
        endOfWindow.setDate(endOfWindow.getDate() + 1);

        console.log("Stats API Date Range:");
        console.log("Start:", startOfWindow.toISOString());
        console.log("End:", endOfWindow.toISOString());
        console.log("");

        // Query exactly like the stats API
        const teamScope = {
            dueDate: { gte: startOfWindow, lt: endOfWindow },
            isArchived: false,
        };

        const [teamTotalDue, teamTotalLive, teamTotalPending] = await Promise.all([
            prisma.review.count({ where: teamScope }),
            prisma.review.count({ where: { ...teamScope, status: "LIVE" } }),
            prisma.review.count({ where: { ...teamScope, status: "PENDING" } }),
        ]);

        console.log("=== STATS API RESULTS ===");
        console.log(`Total due today: ${teamTotalDue}`);
        console.log(`LIVE today: ${teamTotalLive}`);
        console.log(`PENDING today: ${teamTotalPending}`);
        console.log("");

        const initialPending = teamTotalPending + teamTotalLive;
        const progress = initialPending === 0 ? 0 : Math.round((teamTotalLive / initialPending) * 100);

        console.log(`🎯 Progress: ${teamTotalLive} / ${initialPending} = ${progress}%`);
        console.log("");

        // Show what reviews match
        const matchingReviews = await prisma.review.findMany({
            where: teamScope,
            select: {
                status: true,
                dueDate: true,
                profile: { select: { businessName: true } }
            }
        });

        console.log("=== MATCHING REVIEWS ===");
        matchingReviews.forEach(r => {
            console.log(`${r.status.padEnd(12)} | ${new Date(r.dueDate).toISOString()} | ${r.profile.businessName}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testStatsQuery();
