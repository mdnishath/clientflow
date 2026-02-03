// Seed script for initial templates
// Run with: npx tsx prisma/seed-templates.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_TEMPLATES = [
    {
        name: "Quick Praise",
        lines: 1,
        promptInstruction: `Write a SINGLE short sentence (max 10 words). 
DO NOT mention the business name at all.
Example: "Great service, very satisfied." or "Excellent quality!" or "Perfect, just perfect."`,
        exampleOutput: "Excellent service!",
        namePosition: "none",
        category: "short",
    },
    {
        name: "Name First",
        lines: 1,
        promptInstruction: `Write a single sentence (max 15 words).
START with the business name "{businessName}".
Example: "{businessName} is amazing!" or "{businessName} never disappoints."`,
        exampleOutput: "{Name} is amazing!",
        namePosition: "start",
        category: "short",
    },
    {
        name: "Thanks Ending",
        lines: 2,
        promptInstruction: `Write 2 short sentences.
First sentence about the experience (NO business name).
Second sentence ends with thanking "{businessName}".
Example: "Had a wonderful time. Thanks to {businessName}!"`,
        exampleOutput: "Had a wonderful time. Thanks {Name}!",
        namePosition: "end",
        category: "casual",
    },
    {
        name: "Casual Chat",
        lines: 2,
        promptInstruction: `Write 2 casual sentences like talking to a friend.
DO NOT mention any business name.
Example: "Went there last week. Really nice vibe."`,
        exampleOutput: "Went there last week. Really nice vibe.",
        namePosition: "none",
        category: "casual",
    },
    {
        name: "Detailed with Name",
        lines: 3,
        promptInstruction: `Write 3 sentences.
START the first sentence with "{businessName}".
Be detailed about the experience.
Example: "{businessName} exceeded my expectations. The quality was top notch. Will definitely return."`,
        exampleOutput: "{Name} exceeded expectations. Quality was top. Will return.",
        namePosition: "start",
        category: "detailed",
    },
    {
        name: "Story Style",
        lines: 3,
        promptInstruction: `Write 3 sentences in story style.
DO NOT mention any business name.
Start with "Was looking for..." or "Needed..." or "Came here because...".
Example: "Was looking for a good place. Found exactly what I needed. Very happy with my choice."`,
        exampleOutput: "Was looking for... Found it. Very happy.",
        namePosition: "none",
        category: "detailed",
    },
    {
        name: "Enthusiastic Middle",
        lines: 2,
        promptInstruction: `Write 2 enthusiastic sentences.
Mention "{businessName}" in the MIDDLE of your review.
Example: "Absolutely love it! {businessName} has become my favorite spot."`,
        exampleOutput: "Love it! {Name} is my favorite!",
        namePosition: "middle",
        category: "casual",
    },
    {
        name: "Professional",
        lines: 2,
        promptInstruction: `Write 2 professional, formal sentences.
DO NOT mention any business name.
Example: "Quality service and professional staff. Highly recommended."`,
        exampleOutput: "Quality service. Highly recommended.",
        namePosition: "none",
        category: "professional",
    },
    {
        name: "Question Hook",
        lines: 2,
        promptInstruction: `Start with a rhetorical question, then recommend.
Mention "{businessName}" early.
Example: "Looking for quality? {businessName} is the answer. Highly recommend!"`,
        exampleOutput: "Looking for quality? {Name} is the answer!",
        namePosition: "start",
        category: "casual",
    },
    {
        name: "Ultra Short",
        lines: 1,
        promptInstruction: `Write just 2-5 words. Very minimal.
DO NOT mention any business name.
Can include an emoji.
Examples: "Excellent." or "Perfect! 👍" or "Love it." or "Top quality."`,
        exampleOutput: "Perfect! 👍",
        namePosition: "none",
        category: "short",
    },
];

async function main() {
    // Get first user (for development)
    const user = await prisma.user.findFirst();

    if (!user) {
        console.log("No user found. Create a user first.");
        return;
    }

    console.log(`Seeding templates for user: ${user.email}`);

    for (const template of INITIAL_TEMPLATES) {
        const existing = await prisma.reviewTemplate.findFirst({
            where: { userId: user.id, name: template.name },
        });

        if (existing) {
            console.log(`  Skipping "${template.name}" (already exists)`);
            continue;
        }

        await prisma.reviewTemplate.create({
            data: {
                userId: user.id,
                ...template,
            },
        });
        console.log(`  Created "${template.name}"`);
    }

    console.log("Done!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
