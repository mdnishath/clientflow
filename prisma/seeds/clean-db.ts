import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log('🗑️ Clearing database (keeping users)...\n');

    // Clear in order to respect foreign keys
    console.log('  - Deleting notifications...');
    await prisma.notification.deleteMany();

    console.log('  - Deleting reviews...');
    await prisma.review.deleteMany();

    console.log('  - Deleting tasks...');
    await prisma.task.deleteMany();

    console.log('  - Deleting templates...');
    await prisma.reviewTemplate.deleteMany();

    console.log('  - Deleting contexts...');
    await prisma.reviewContext.deleteMany();

    console.log('  - Deleting categories...');
    await prisma.category.deleteMany();

    console.log('  - Deleting profiles...');
    await prisma.gmbProfile.deleteMany();

    console.log('  - Deleting clients...');
    await prisma.client.deleteMany();

    console.log('\n✅ Done! All data cleared except users.');
}

cleanDatabase()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
