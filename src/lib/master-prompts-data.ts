
export interface MasterPrompt {
    category: string;
    title: string;
    prompt: string;
}

export const MASTER_PROMPTS_DATA: MasterPrompt[] = [
    // ============================================
    // ROOFING (WITH NAME)
    // ============================================
    {
        category: "Roofing",
        title: "Full Replacement (With Name)",
        prompt: `1.context: Replaced old shingle roof. Finished in 2 days. Crew was polite. 2.word limit: 50-70 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Leak Repair (With Name)",
        prompt: `1.context: Fixed a leaking spot after heavy rain. Diagnosed quickly. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Storm Damage (With Name)",
        prompt: `1.context: Roof damaged by storm wind. They tarped it immediately and fixed it next day. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Metal Roof (With Name)",
        prompt: `1.context: Installed new metal roof on barn. Looks amazing. Long warranty. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Flat Roof Coating (With Name)",
        prompt: `1.context: Recoated commercial flat roof. Extended life of roof. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Gutter & Fascia (With Name)",
        prompt: `1.context: Replaced rotting fascia and new gutters. House looks new. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Skylight Install (With Name)",
        prompt: `1.context: Installed 2 skylights. No leaks. Great natural light. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Chimney Flashing (With Name)",
        prompt: `1.context: Fixed leak around chimney. Matched shingles perfectly. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "Annual Inspection (With Name)",
        prompt: `1.context: Yearly roof checkup. Found loose shingles and fixed for cheap. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Roofing",
        title: "General Service (With Name)",
        prompt: `1.context: Great experience from quote to cleanup. Highly professional. 2.word limit: 30-45 3.name include in reviewtex: yes`
    },

    // ============================================
    // ROOFING (NO NAME)
    // ============================================
    {
        category: "Roofing",
        title: "Full Replacement (No Name)",
        prompt: `1.context: Replaced old shingle roof. Finished in 2 days. Crew was polite. 2.word limit: 50-70 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Leak Repair (No Name)",
        prompt: `1.context: Fixed a leaking spot after heavy rain. Diagnosed quickly. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Storm Damage (No Name)",
        prompt: `1.context: Roof damaged by storm wind. They tarped it immediately and fixed it next day. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Metal Roof (No Name)",
        prompt: `1.context: Installed new metal roof on barn. Looks amazing. Long warranty. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Flat Roof Coating (No Name)",
        prompt: `1.context: Recoated commercial flat roof. Extended life of roof. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Gutter & Fascia (No Name)",
        prompt: `1.context: Replaced rotting fascia and new gutters. House looks new. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Skylight Install (No Name)",
        prompt: `1.context: Installed 2 skylights. No leaks. Great natural light. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Chimney Flashing (No Name)",
        prompt: `1.context: Fixed leak around chimney. Matched shingles perfectly. 2.word limit: 25-30 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "Annual Inspection (No Name)",
        prompt: `1.context: Yearly roof checkup. Found loose shingles and fixed for cheap. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Roofing",
        title: "General Service (No Name)",
        prompt: `1.context: Great experience from quote to cleanup. Highly professional. 2.word limit: 30-45 3.name include in reviewtex: no`
    }
];
