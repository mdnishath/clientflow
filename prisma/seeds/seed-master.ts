import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import {
    ELECTRICIAN,
    ROOFING,
    PLUMBER,
    PLASTERER,
    MASONRY,
    LOCKSMITH,
    INSULATION,
    LED_LIGHT,
    ART_RESTORATION
} from "./data/master-data";

const prisma = new PrismaClient();

const INDUSTRIES = [
    { name: "Electricien", slug: "ELECTRICIAN", data: ELECTRICIAN },
    { name: "Couvreur", slug: "ROOFING_CONTRACTOR", data: ROOFING },
    { name: "Plombier", slug: "PLUMBER", data: PLUMBER },
    { name: "Plâtrier", slug: "PLASTERER", data: PLASTERER },
    { name: "Maçon", slug: "MASONRY_CONTRACTOR", data: MASONRY },
    { name: "Serrurier", slug: "LOCKSMITH", data: LOCKSMITH },
    { name: "Isolation", slug: "INSULATION_CONTRACTOR", data: INSULATION },
    { name: "LED Intérieur", slug: "LED_LIGHT_INSTALL", data: LED_LIGHT },
    { name: "Restauration Tapis", slug: "ART_RESTORATION_SERVICE", data: ART_RESTORATION },
];

async function main() {
    console.log("🌱 Starting FRENCH HIGH-FIDELITY Master Seed...\n");

    const adminEmail = "nishatbd3388@gmail.com";
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

    // Ensure admin exists
    if (!admin) {
        console.log("⚠️ Admin not found, checking for any admin...");
        admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (!admin) {
            console.log("❌ No admin found. Please run seed-admin.ts first.");
            return;
        }
    }

    // Process each industry
    for (const industry of INDUSTRIES) {
        console.log(`\nProcessing: ${industry.name} (${industry.slug})...`);

        // 1. Create/Find Category
        await prisma.category.upsert({
            where: {
                userId_slug: { userId: admin.id, slug: industry.slug }
            },
            update: {},
            create: {
                userId: admin.id,
                name: industry.name,
                slug: industry.slug,
                description: `Catégorie principale pour ${industry.name}`,
                isActive: true
            }
        });

        // 2. Create Templates (Hardcoded High Quality)
        const templatesData = [];
        const templates = industry.data.templates;

        for (let i = 0; i < templates.length; i++) {
            const templateText = templates[i];
            const name = `${industry.name} ${i + 1}`;

            // Determine lines roughly by length or random for variety if short
            const lines = templateText.length > 100 ? 3 : (templateText.length > 50 ? 2 : 1);

            templatesData.push({
                userId: admin.id,
                name: name,
                lines: lines,
                promptInstruction: templateText, // The "Instruction" is the text itself for these static ones, or could be "Write: ..."
                exampleOutput: templateText,
                category: industry.slug,
                tags: [industry.slug, "french_seed"],
                isActive: true
            });
        }

        // Batch insert templates
        // We use loops for safety if count > DB limit, but 50 is fine
        await prisma.reviewTemplate.createMany({
            data: templatesData.map(t => ({
                userId: t.userId,
                name: t.name,
                lines: t.lines,
                promptInstruction: t.promptInstruction,
                exampleOutput: t.exampleOutput,
                category: t.category,
                tags: t.tags,
                isActive: t.isActive
            }))
        });
        console.log(`   ✅ Created ${templatesData.length} Templates`);

        // 3. Create Contexts (Hardcoded High Quality)
        const contextsData = [];
        const contexts = industry.data.contexts;

        for (let i = 0; i < contexts.length; i++) {
            const scenario = contexts[i];

            contextsData.push({
                userId: admin.id,
                type: "scenario",
                title: `${industry.name} - ${scenario.substring(0, 30)}...`,
                content: `Client ayant besoin de : ${scenario}. Le service doit être professionnel et adapté.`,
                category: industry.slug,
                tags: [industry.slug, "french_seed"],
                isActive: true
            });
        }

        await prisma.reviewContext.createMany({
            data: contextsData
        });
        console.log(`   ✅ Created ${contextsData.length} Contexts`);
    }

    console.log("\n🎉 French Seed Completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
