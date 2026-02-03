import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
    { name: "General", slug: "GENERAL", icon: "📁", color: "#6366f1", isSystem: true, sortOrder: 0 },
    { name: "Roofing Contractor", slug: "ROOFING_CONTRACTOR", icon: "🏠", color: "#ef4444", sortOrder: 1 },
    { name: "Restaurant", slug: "RESTAURANT", icon: "🍽️", color: "#f97316", sortOrder: 2 },
    { name: "Plumbing", slug: "PLUMBING", icon: "🔧", color: "#0ea5e9", sortOrder: 3 },
    { name: "Electrical", slug: "ELECTRICAL", icon: "⚡", color: "#eab308", sortOrder: 4 },
    { name: "HVAC", slug: "HVAC", icon: "❄️", color: "#14b8a6", sortOrder: 5 },
    { name: "Landscaping", slug: "LANDSCAPING", icon: "🌿", color: "#22c55e", sortOrder: 6 },
    { name: "Cleaning", slug: "CLEANING", icon: "🧹", color: "#8b5cf6", sortOrder: 7 },
    { name: "Dental", slug: "DENTAL", icon: "🦷", color: "#ec4899", sortOrder: 8 },
    { name: "Medical", slug: "MEDICAL", icon: "🏥", color: "#ef4444", sortOrder: 9 },
    { name: "Salon", slug: "SALON", icon: "💇", color: "#ec4899", sortOrder: 10 },
    { name: "Auto Repair", slug: "AUTO_REPAIR", icon: "🚗", color: "#6366f1", sortOrder: 11 },
    { name: "Legal", slug: "LEGAL", icon: "⚖️", color: "#3b82f6", sortOrder: 12 },
    { name: "Real Estate", slug: "REAL_ESTATE", icon: "🏡", color: "#22c55e", sortOrder: 13 },
    { name: "Fitness", slug: "FITNESS", icon: "💪", color: "#ef4444", sortOrder: 14 },
    { name: "Retail", slug: "RETAIL", icon: "🛒", color: "#f97316", sortOrder: 15 },
];

async function seedCategories() {
    console.log("🏷️ Seeding default categories...\n");

    // Get system user
    let systemUser = await prisma.user.findFirst({
        where: { email: "system@reviewbot.local" }
    });

    if (!systemUser) {
        console.log("Creating system user for categories...");
        systemUser = await prisma.user.create({
            data: {
                email: "system@reviewbot.local",
                passwordHash: "seed-user-no-login",
                name: "System Templates"
            }
        });
    }

    const userId = systemUser.id;

    // Check existing categories
    const existingCount = await prisma.category.count({
        where: { userId }
    });

    if (existingCount > 0) {
        console.log(`⚠️  ${existingCount} categories already exist. Skipping seed.`);
        console.log("Use --force flag to reset categories.\n");
        return;
    }

    // Insert categories
    console.log(`📝 Inserting ${DEFAULT_CATEGORIES.length} categories...`);

    for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.create({
            data: {
                userId,
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                isSystem: cat.isSystem || false,
                sortOrder: cat.sortOrder,
                isActive: true,
            }
        });
    }

    console.log("✅ Categories seeded!\n");

    // Summary
    const finalCount = await prisma.category.count({ where: { userId } });
    console.log(`📊 Total categories: ${finalCount}`);
}

seedCategories()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
