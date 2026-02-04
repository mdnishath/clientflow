import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log(" Starting Admin Seed...");

    // Password: password123
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
        // We use explicit Role.ADMIN to match the schema Enum
        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                role: Role.ADMIN, // Ensure existing users are promoted to ADMIN
                canDelete: true,
            },
            create: {
                email: admin.email,
                name: admin.name,
                role: Role.ADMIN,
                passwordHash,
                canDelete: true,
            },
        });
        console.log(` Upserted ADMIN: ${user.email} | Role: ${user.role}`);
    }

    console.log("\n Admin Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error(" Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

