import { PrismaClient, ReviewStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting Multi-Tenant RBAC Seed...\n");

    // Cleanup
    await prisma.reviewTag.deleteMany();
    await prisma.review.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.gmbProfile.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await hash("password123", 10);

    // ==========================================
    // ADMIN USER - The service provider (YOU)
    // Can see ALL data, manage ALL clients
    // ==========================================
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@clientflow.local",
            name: "Admin User",
            role: "ADMIN",
            canDelete: true,
            passwordHash,
        },
    });
    console.log(`✅ Created ADMIN user: ${adminUser.email}`);

    // ==========================================
    // Create Clients (Your customers)
    // ==========================================
    const alex = await prisma.client.create({
        data: {
            userId: adminUser.id,
            name: "Alex Johnson",
            email: "alex@example.com",
            phone: "+1 555-0101",
            notes: "Needs 20 reviews for various businesses",
        },
    });

    const leo = await prisma.client.create({
        data: {
            userId: adminUser.id,
            name: "Leo Smith",
            email: "leo@example.com",
            phone: "+1 555-0202",
            notes: "Needs 10 reviews for his restaurants",
        },
    });

    console.log("✅ Created clients: Alex and Leo");

    // ==========================================
    // CLIENT USERS - Customer login accounts
    // Each linked to their Client entity
    // ==========================================

    // Alex's login account - CAN delete (permission granted)
    const alexUser = await prisma.user.create({
        data: {
            email: "alex@clientflow.local",
            name: "Alex Johnson",
            role: "CLIENT",
            clientId: alex.id, // Linked to Alex's client entity
            canDelete: true, // Admin granted delete permission
            passwordHash,
        },
    });
    console.log(`✅ Created CLIENT user for Alex: ${alexUser.email} (canDelete: true)`);

    // Leo's login account - CANNOT delete (default)
    const leoUser = await prisma.user.create({
        data: {
            email: "leo@clientflow.local",
            name: "Leo Smith",
            role: "CLIENT",
            clientId: leo.id, // Linked to Leo's client entity
            canDelete: false, // Default - no delete permission
            passwordHash,
        },
    });
    console.log(`✅ Created CLIENT user for Leo: ${leoUser.email} (canDelete: false)`);

    // ==========================================
    // Create GMB Profiles
    // ==========================================
    const alexProfiles = [];
    const categories = ["Restaurant", "Plumber", "Dentist", "Lawyer", "Gym"];

    for (let i = 1; i <= 20; i++) {
        const category = categories[i % categories.length];
        const profile = await prisma.gmbProfile.create({
            data: {
                clientId: alex.id,
                businessName: `Alex's ${category} ${i}`,
                gmbLink: `https://g.page/alex-${category.toLowerCase()}-${i}`,
                category: category,
            },
        });
        alexProfiles.push(profile);
    }
    console.log("✅ Created 20 GMB profiles for Alex");

    const leoProfiles = [];
    for (let i = 1; i <= 10; i++) {
        const profile = await prisma.gmbProfile.create({
            data: {
                clientId: leo.id,
                businessName: `Leo's Burger Joint ${i}`,
                gmbLink: `https://g.page/leos-burgers-${i}`,
                category: "Restaurant",
            },
        });
        leoProfiles.push(profile);
    }
    console.log("✅ Created 10 GMB profiles for Leo");

    // ==========================================
    // Create Reviews
    // ==========================================
    const allProfiles = [...alexProfiles, ...leoProfiles];
    let reviewCount = 0;

    for (const profile of allProfiles) {
        const numReviews = Math.floor(Math.random() * 2) + 2;

        for (let j = 0; j < numReviews; j++) {
            const statuses = Object.values(ReviewStatus);
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            await prisma.review.create({
                data: {
                    userId: adminUser.id, // Admin created these reviews
                    profileId: profile.id,
                    reviewText: status === "PENDING" ? null : `Great service at ${profile.businessName}!`,
                    status: status,
                    dueDate: new Date(Date.now() + Math.random() * 1000000000),
                    notes: "Generated by seed",
                },
            });
            reviewCount++;
        }
    }

    console.log(`✅ Created ${reviewCount} reviews across 30 profiles`);

    // Summary
    console.log("\n🎉 Multi-Tenant RBAC Seed completed!");
    console.log("\n📝 Login credentials:");
    console.log("┌─────────────────────────────────────────────────────────────────┐");
    console.log("│ Role   │ Email                      │ Password    │ Can Delete │");
    console.log("├─────────────────────────────────────────────────────────────────┤");
    console.log("│ ADMIN  │ admin@clientflow.local     │ password123 │ ✅ Yes     │");
    console.log("│ CLIENT │ alex@clientflow.local      │ password123 │ ✅ Yes     │");
    console.log("│ CLIENT │ leo@clientflow.local       │ password123 │ ❌ No      │");
    console.log("└─────────────────────────────────────────────────────────────────┘");
    console.log("\n📋 Data Access:");
    console.log("   • Admin sees ALL data (all clients, profiles, reviews)");
    console.log("   • Alex sees ONLY Alex's data (20 profiles)");
    console.log("   • Leo sees ONLY Leo's data (10 profiles)");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
