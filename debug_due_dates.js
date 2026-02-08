const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviews() {
    try {
        // Create server-side "Today"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(today);
        const end = new Date(today);
        end.setDate(end.getDate() + 1);

        console.log("Server Time:", new Date().toISOString());
        console.log("Checking reviews between:", start.toISOString(), "and", end.toISOString());

        const pendingReviews = await prisma.review.findMany({
            where: {
                status: "PENDING",
            },
            include: { profile: { select: { businessName: true } } }
        });

        console.log("Total Pending Reviews found:", pendingReviews.length);
        pendingReviews.forEach(r => {
            console.log(`Review ${r.id} (${r.profile.businessName}): Status=${r.status}, DueDate=${r.dueDate ? r.dueDate.toISOString() : 'NULL'}`);
            if (r.dueDate) {
                const d = new Date(r.dueDate);
                if (d >= start && d < end) {
                    console.log("  -> IS DUE TODAY (matches window)");
                } else {
                    console.log("  -> NOT due today (outside window)");
                }
            } else {
                console.log("  -> Null due date");
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviews();
