
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const clientId = 'cmle3tfcj005rl6jo5uyo59o1';

    console.log(`Checking Client: ${clientId}`);

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { adminUser: true, gmbProfiles: true }
    });

    if (!client) {
        console.log('Client not found!');
        return;
    }

    console.log('Client Name:', client.name);
    console.log('Client Owner ID:', client.userId);
    console.log('Client Owner Email:', client.adminUser?.email);

    console.log(`Found ${client.gmbProfiles.length} profiles for this client:`);
    client.gmbProfiles.forEach(p => {
        console.log(`- Profile: ${p.businessName} (ID: ${p.id})`);
    });

    // Also check all users to see if we have multiple admins
    const users = await prisma.user.findMany();
    console.log('\nAll Users:');
    users.forEach(u => {
        console.log(`- User: ${u.email} (ID: ${u.id}, Role: ${u.role})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
