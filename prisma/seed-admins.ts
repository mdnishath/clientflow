
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = "Manha369@@";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admins = [
        {
            email: "hi@client-flow.xyz",
            name: "Admin One",
        },
        {
            email: "sufian@client-flow.xyz",
            name: "Admin Two",
        },
    ];

    console.log("🌱 Seeding admins...");

    for (const admin of admins) {
        const user = await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                passwordHash: hashedPassword,
                role: Role.ADMIN, // Ensure they are admins
            },
            create: {
                email: admin.email,
                name: admin.name,
                passwordHash: hashedPassword,
                role: Role.ADMIN,
            },
        });
        console.log(`✅ Admin upserted: ${user.email}`);
    }

    console.log("🏁 Admin seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
