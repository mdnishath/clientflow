// Bulk seed script for category-specific templates and contexts
// Run with: npx tsx prisma/seed-all.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Category-specific templates
const CATEGORY_TEMPLATES = [
    // GENERAL (works for all)
    { category: "GENERAL", name: "Quick Praise", lines: 1, namePosition: "none", promptInstruction: `Write a SINGLE short sentence (max 10 words). DO NOT mention the business name.`, exampleOutput: "Excellent service!" },
    { category: "GENERAL", name: "Casual Chat", lines: 2, namePosition: "none", promptInstruction: `Write 2 casual sentences like talking to a friend. NO business name.`, exampleOutput: "Went there last week. Really nice." },
    { category: "GENERAL", name: "Name First", lines: 1, namePosition: "start", promptInstruction: `Write single sentence starting with "{businessName}".`, exampleOutput: "{Name} is amazing!" },
    { category: "GENERAL", name: "Professional", lines: 2, namePosition: "none", promptInstruction: `Write 2 professional, formal sentences. NO business name.`, exampleOutput: "Quality service. Highly recommended." },

    // ROOFING
    { category: "ROOFING", name: "Roof Repair Praise", lines: 2, namePosition: "end", promptInstruction: `Write 2 sentences about roof repair experience. Mention quick/clean work. End with thanking {businessName}.`, exampleOutput: "Fixed our leak fast. Thanks {Name}!" },
    { category: "ROOFING", name: "Storm Damage Fix", lines: 3, namePosition: "start", promptInstruction: `Write 3 sentences. Start with {businessName}. Mention storm damage repair, inspection, and professionalism.`, exampleOutput: "{Name} came after the storm. Thorough inspection. Great work." },
    { category: "ROOFING", name: "New Roof Install", lines: 2, namePosition: "none", promptInstruction: `Write 2 sentences about new roof installation. Mention crew, cleanliness, quality. NO business name.`, exampleOutput: "Crew was professional. New roof looks great." },

    // RESTAURANT
    { category: "RESTAURANT", name: "Food Praise", lines: 1, namePosition: "none", promptInstruction: `Write 1 short sentence about delicious food. NO business name.`, exampleOutput: "Amazing food!" },
    { category: "RESTAURANT", name: "Dining Experience", lines: 2, namePosition: "middle", promptInstruction: `Write 2 sentences about dining. Mention {businessName} naturally in middle.`, exampleOutput: "Great atmosphere. {Name} has the best pasta!" },
    { category: "RESTAURANT", name: "Service + Food", lines: 3, namePosition: "end", promptInstruction: `Write 3 sentences: food, service, overall. End with {businessName}.`, exampleOutput: "Food was delicious. Fast service. Love {Name}!" },

    // PLUMBING
    { category: "PLUMBING", name: "Emergency Fix", lines: 2, namePosition: "start", promptInstruction: `Write 2 sentences. Start with {businessName}. Mention emergency response and quick fix.`, exampleOutput: "{Name} came in an hour. Fixed the leak fast." },
    { category: "PLUMBING", name: "Plumber Praise", lines: 1, namePosition: "none", promptInstruction: `Write 1 short sentence about plumber. Mention professional/clean work. NO name.`, exampleOutput: "Very professional plumber!" },

    // ELECTRICAL
    { category: "ELECTRICAL", name: "Electrical Work", lines: 2, namePosition: "none", promptInstruction: `Write 2 sentences about electrical work. Mention safety/expertise. NO business name.`, exampleOutput: "Safe and professional work. Explained everything clearly." },
    { category: "ELECTRICAL", name: "Panel Upgrade", lines: 2, namePosition: "start", promptInstruction: `Write 2 sentences. Start with {businessName}. Mention electrical panel/upgrade work.`, exampleOutput: "{Name} upgraded our panel. Very satisfied." },

    // DENTAL
    { category: "DENTAL", name: "Dental Visit", lines: 2, namePosition: "none", promptInstruction: `Write 2 sentences about dental visit. Mention gentle/painless care. NO business name.`, exampleOutput: "Gentle and caring. Best dentist ever." },
    { category: "DENTAL", name: "Great Dentist", lines: 1, namePosition: "end", promptInstruction: `Write 1 sentence ending with thanks to {businessName}.`, exampleOutput: "Painless cleaning. Thanks {Name}!" },

    // SALON
    { category: "SALON", name: "Haircut Praise", lines: 1, namePosition: "none", promptInstruction: `Write 1 short sentence about haircut/styling. NO business name.`, exampleOutput: "Best haircut ever!" },
    { category: "SALON", name: "Beauty Experience", lines: 2, namePosition: "middle", promptInstruction: `Write 2 sentences about salon. Mention {businessName} naturally.`, exampleOutput: "Love my new look. {Name} never disappoints!" },

    // AUTO_REPAIR
    { category: "AUTO_REPAIR", name: "Car Repair", lines: 2, namePosition: "start", promptInstruction: `Write 2 sentences. Start with {businessName}. Mention honest/fair pricing.`, exampleOutput: "{Name} fixed my car fast. Fair price too." },
    { category: "AUTO_REPAIR", name: "Mechanic Praise", lines: 1, namePosition: "none", promptInstruction: `Write 1 sentence about mechanic. Mention trustworthy/honest. NO name.`, exampleOutput: "Honest mechanic, finally!" },
];

// Category-specific contexts
const CATEGORY_CONTEXTS = [
    // GENERAL PERSONAS
    { type: "persona", category: "GENERAL", title: "Happy Customer", content: "A satisfied customer who had a great experience and wants to share.", tone: "enthusiastic" },
    { type: "persona", category: "GENERAL", title: "Busy Professional", content: "A busy professional who values efficiency and quick service.", tone: "brief" },
    { type: "persona", category: "GENERAL", title: "First Timer", content: "A first-time customer who was pleasantly surprised by the quality.", tone: "authentic" },

    // GENERAL SCENARIOS
    { type: "scenario", category: "GENERAL", title: "Regular Service", content: "Customer came for regular service and was satisfied.", tone: "casual" },
    { type: "scenario", category: "GENERAL", title: "Recommendation", content: "Customer was recommended by a friend and the experience exceeded expectations.", tone: "grateful" },

    // ROOFING PERSONAS
    { type: "persona", category: "ROOFING", title: "Homeowner Storm Damage", content: "A homeowner whose roof was damaged in a storm and needed urgent repair.", tone: "grateful" },
    { type: "persona", category: "ROOFING", title: "New Homeowner", content: "A new homeowner who needed roof inspection before buying.", tone: "professional" },
    { type: "persona", category: "ROOFING", title: "Long-time Resident", content: "A long-time resident who finally replaced their old roof.", tone: "authentic" },

    // ROOFING SCENARIOS
    { type: "scenario", category: "ROOFING", title: "Leak Repair", content: "Roof was leaking after heavy rain. Company came quickly and fixed it.", tone: "grateful" },
    { type: "scenario", category: "ROOFING", title: "Full Replacement", content: "Complete roof replacement. Crew was professional and cleaned up well.", tone: "enthusiastic" },
    { type: "scenario", category: "ROOFING", title: "Inspection", content: "Free roof inspection after storm. Found issues and provided honest quote.", tone: "professional" },

    // RESTAURANT PERSONAS
    { type: "persona", category: "RESTAURANT", title: "Food Lover", content: "A food enthusiast who appreciates quality ingredients and flavors.", tone: "enthusiastic" },
    { type: "persona", category: "RESTAURANT", title: "Family Diner", content: "A parent who brought the whole family for dinner.", tone: "casual" },
    { type: "persona", category: "RESTAURANT", title: "Date Night", content: "A couple who went for a romantic dinner.", tone: "authentic" },

    // RESTAURANT SCENARIOS
    { type: "scenario", category: "RESTAURANT", title: "Special Occasion", content: "Birthday dinner. Staff made it special with surprise dessert.", tone: "grateful" },
    { type: "scenario", category: "RESTAURANT", title: "Quick Lunch", content: "Quick lunch during work break. Food was fast and delicious.", tone: "brief" },

    // PLUMBING PERSONAS
    { type: "persona", category: "PLUMBING", title: "Emergency Caller", content: "Someone who had a plumbing emergency at night or weekend.", tone: "grateful" },
    { type: "persona", category: "PLUMBING", title: "Renovation Customer", content: "Customer doing bathroom renovation and needed plumbing work.", tone: "professional" },

    // PLUMBING SCENARIOS
    { type: "scenario", category: "PLUMBING", title: "Pipe Burst", content: "Pipe burst in the middle of the night. Plumber arrived within an hour.", tone: "grateful" },
    { type: "scenario", category: "PLUMBING", title: "Drain Cleaning", content: "Clogged drain fixed quickly. Also checked other pipes for free.", tone: "authentic" },

    // DENTAL PERSONAS
    { type: "persona", category: "DENTAL", title: "Nervous Patient", content: "A patient who is usually nervous about dental visits.", tone: "grateful" },
    { type: "persona", category: "DENTAL", title: "Family Dental", content: "A parent who brings the whole family for checkups.", tone: "casual" },

    // DENTAL SCENARIOS
    { type: "scenario", category: "DENTAL", title: "Routine Cleaning", content: "Regular cleaning and checkup. Dentist was gentle and explained everything.", tone: "authentic" },
    { type: "scenario", category: "DENTAL", title: "Emergency Toothache", content: "Emergency appointment for sudden toothache. Got relief same day.", tone: "grateful" },

    // SALON PERSONAS
    { type: "persona", category: "SALON", title: "Style Seeker", content: "Someone who wanted a fresh new look and transformation.", tone: "enthusiastic" },
    { type: "persona", category: "SALON", title: "Regular Client", content: "A regular client who always comes to the same stylist.", tone: "authentic" },

    // SALON SCENARIOS
    { type: "scenario", category: "SALON", title: "Color Treatment", content: "Hair coloring session. Color came out exactly as wanted.", tone: "enthusiastic" },
    { type: "scenario", category: "SALON", title: "Special Event Prep", content: "Getting ready for a wedding. Hair and makeup were perfect.", tone: "grateful" },

    // AUTO_REPAIR PERSONAS
    { type: "persona", category: "AUTO_REPAIR", title: "Car Owner", content: "Regular car owner who values honest pricing and good work.", tone: "authentic" },
    { type: "persona", category: "AUTO_REPAIR", title: "Breakdown Victim", content: "Someone whose car broke down unexpectedly.", tone: "grateful" },

    // AUTO_REPAIR SCENARIOS
    { type: "scenario", category: "AUTO_REPAIR", title: "Engine Trouble", content: "Engine making strange noise. Diagnosed and fixed at fair price.", tone: "authentic" },
    { type: "scenario", category: "AUTO_REPAIR", title: "Regular Maintenance", content: "Oil change and inspection. Completed quickly, no upselling.", tone: "brief" },
];

async function main() {
    // Get first user
    const user = await prisma.user.findFirst();

    if (!user) {
        console.log("No user found. Create a user first.");
        return;
    }

    console.log(`\n📋 Seeding data for user: ${user.email}\n`);

    // Seed Templates
    console.log("📝 TEMPLATES:");
    for (const template of CATEGORY_TEMPLATES) {
        const existing = await prisma.reviewTemplate.findFirst({
            where: { userId: user.id, name: template.name, category: template.category },
        });

        if (existing) {
            console.log(`  ⏭️  Skip: ${template.category} / ${template.name}`);
            continue;
        }

        await prisma.reviewTemplate.create({
            data: {
                userId: user.id,
                ...template,
            },
        });
        console.log(`  ✅ Created: ${template.category} / ${template.name}`);
    }

    // Seed Contexts
    console.log("\n🎭 CONTEXTS:");
    for (const context of CATEGORY_CONTEXTS) {
        const existing = await prisma.reviewContext.findFirst({
            where: { userId: user.id, title: context.title, category: context.category },
        });

        if (existing) {
            console.log(`  ⏭️  Skip: ${context.category} / ${context.title}`);
            continue;
        }

        await prisma.reviewContext.create({
            data: {
                userId: user.id,
                ...context,
            },
        });
        console.log(`  ✅ Created: ${context.category} / ${context.title}`);
    }

    console.log("\n✨ Done!\n");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
