import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldRoofing() {
    const t = await prisma.reviewTemplate.deleteMany({ where: { category: 'ROOFING' } });
    const c = await prisma.reviewContext.deleteMany({ where: { category: 'ROOFING' } });
    console.log('Old ROOFING Templates deleted:', t.count);
    console.log('Old ROOFING Contexts deleted:', c.count);
    await prisma.$disconnect();
}

cleanupOldRoofing();
