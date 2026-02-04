import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log(" Seeding Admin User only...\n");

    const email = "admin@clientflow.local";
    const password = "password123";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email },
    });

    if (existingAdmin) {
        console.log(` Admin user already exists (${email}). Skipping...`);
        return;
    }

    const passwordHash = await hash(password, 10);

    const adminUser = await prisma.user.create({
        data: {
            email,
            name: "Admin User",
            role: "ADMIN",
            canDelete: true,
            passwordHash,
        },
    });

    console.log(` Created ADMIN user: ${adminUser.email}`);
    console.log(` Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

