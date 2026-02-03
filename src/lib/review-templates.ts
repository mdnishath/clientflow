/**
 * Review Templates Library
 * 
 * 10 templates with varying:
 * - Length: 1-3 lines
 * - Business name usage: none, start, middle, end
 */

export interface ReviewTemplate {
    id: number;
    name: string;
    lines: 1 | 2 | 3;
    businessNamePosition: "none" | "start" | "middle" | "end";
    promptPattern: string;
}

export const REVIEW_TEMPLATES: ReviewTemplate[] = [
    {
        id: 1,
        name: "Quick Praise",
        lines: 1,
        businessNamePosition: "none",
        promptPattern: `Write a SINGLE short sentence (max 10 words). 
DO NOT mention the business name at all.
Example: "Great service, very satisfied." or "Excellent quality!" or "Perfect, just perfect."`,
    },
    {
        id: 2,
        name: "Name First",
        lines: 1,
        businessNamePosition: "start",
        promptPattern: `Write a single sentence (max 15 words).
START with the business name "{businessName}".
Example: "{businessName} is amazing!" or "{businessName} never disappoints."`,
    },
    {
        id: 3,
        name: "Thanks Ending",
        lines: 2,
        businessNamePosition: "end",
        promptPattern: `Write 2 short sentences.
First sentence about the experience (NO business name).
Second sentence ends with thanking "{businessName}".
Example: "Had a wonderful time. Thanks to {businessName}!"`,
    },
    {
        id: 4,
        name: "Casual Chat",
        lines: 2,
        businessNamePosition: "none",
        promptPattern: `Write 2 casual sentences like talking to a friend.
DO NOT mention any business name.
Example: "Went there last week. Really nice vibe."`,
    },
    {
        id: 5,
        name: "Detailed with Name",
        lines: 3,
        businessNamePosition: "start",
        promptPattern: `Write 3 sentences.
START the first sentence with "{businessName}".
Be detailed about the experience.
Example: "{businessName} exceeded my expectations. The quality was top notch. Will definitely return."`,
    },
    {
        id: 6,
        name: "Story Style",
        lines: 3,
        businessNamePosition: "none",
        promptPattern: `Write 3 sentences in story style.
DO NOT mention any business name.
Start with "Was looking for..." or "Needed..." or "Came here because...".
Example: "Was looking for a good place. Found exactly what I needed. Very happy with my choice."`,
    },
    {
        id: 7,
        name: "Enthusiastic Middle",
        lines: 2,
        businessNamePosition: "middle",
        promptPattern: `Write 2 enthusiastic sentences.
Mention "{businessName}" in the MIDDLE of your review.
Example: "Absolutely love it! {businessName} has become my favorite spot."`,
    },
    {
        id: 8,
        name: "Professional",
        lines: 2,
        businessNamePosition: "none",
        promptPattern: `Write 2 professional, formal sentences.
DO NOT mention any business name.
Example: "Quality service and professional staff. Highly recommended."`,
    },
    {
        id: 9,
        name: "Question Hook",
        lines: 2,
        businessNamePosition: "start",
        promptPattern: `Start with a rhetorical question, then recommend.
Mention "{businessName}" early.
Example: "Looking for quality? {businessName} is the answer. Highly recommend!"`,
    },
    {
        id: 10,
        name: "Ultra Short",
        lines: 1,
        businessNamePosition: "none",
        promptPattern: `Write just 2-5 words. Very minimal.
DO NOT mention any business name.
Can include an emoji.
Examples: "Excellent." or "Perfect! 👍" or "Love it." or "Top quality."`,
    },
];

/**
 * Get a random template
 */
export function getRandomTemplate(): ReviewTemplate {
    const index = Math.floor(Math.random() * REVIEW_TEMPLATES.length);
    return REVIEW_TEMPLATES[index];
}

/**
 * Get N random unique templates
 */
export function getRandomTemplates(count: number): ReviewTemplate[] {
    const shuffled = [...REVIEW_TEMPLATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, REVIEW_TEMPLATES.length));
}

/**
 * Build instruction from template
 */
export function buildTemplateInstruction(template: ReviewTemplate, businessName: string): string {
    let instruction = template.promptPattern;

    // Replace placeholder with actual business name
    instruction = instruction.replace(/\{businessName\}/g, businessName);

    return instruction;
}
