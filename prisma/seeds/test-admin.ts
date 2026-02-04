import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log(" Starting Admin Seed...\n");

    const passwordHash = await hash("password123", 10);

    const admins = [
        {
            email: "admin1@clientflow.local",
            name: "Admin One",
        },
        {
            email: "admin2@clientflow.local",
            name: "Admin Two",
        },
    ];

    for (const admin of admins) {
        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {},
            create: {
                email: admin.email,
                name: admin.name,
                role: "ADMIN",
                passwordHash,
                canDelete: true,
            },
        });
        console.log(` Upserted ADMIN: ${user.email}`);
    }

    console.log("\n Admin Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

