import { prisma } from "@/lib/prisma";

async function main() {
    console.log("Creating dummy pending reviews...");

    // Get profiles
    const profiles = await prisma.gmbProfile.findMany({ take: 2 });
    if (profiles.length === 0) {
        console.log("No profiles found to create reviews for.");
        return;
    }

    // Create 5 pending reviews for the first profile
    const profile = profiles[0];
    const client = await prisma.client.findFirst({ where: { id: profile.clientId || undefined } });

    if (!client) {
        console.log("No client found for profile.");
        return;
    }

    await prisma.review.createMany({
        data: Array(5).fill(null).map(() => ({
            profileId: profile.id,
            status: "PENDING" as const, // Cast to literal type
            userId: client.userId,
            dueDate: new Date(),
        })),
    });

    console.log(`Created 5 pending reviews for ${profile.businessName}`);

    const count = await prisma.review.count({ where: { status: "PENDING", isArchived: false } });
    console.log(`Total PENDING reviews: ${count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
