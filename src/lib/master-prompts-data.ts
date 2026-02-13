
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
    },

    // ============================================
    // TREE SERVICE (WITH NAME)
    // ============================================
    {
        category: "Tree Service",
        title: "Tree Removal (With Name)",
        prompt: `1.context: Removed large oak tree near house. Used crane. Safe and efficient. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Stump Grinding (With Name)",
        prompt: `1.context: Ground stump well below grade. Clened up all wood chips. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Trimming (With Name)",
        prompt: `1.context: Trimmed overgrown branches. Tree looks healthier and safer. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Emergency Storm (With Name)",
        prompt: `1.context: Tree fell on driveway during storm. Came out immediately to clear it. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Lot Clearing (With Name)",
        prompt: `1.context: Cleared lot for new construction. Fast and thorough. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Deadwood Removal (With Name)",
        prompt: `1.context: Removed dangerous dead limbs over the roof. Professional crew. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Palm Trimming (With Name)",
        prompt: `1.context: Cleaned up palm trees. Removed seed pods and dead fronds. 2.word limit: 20-30 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Cabling (With Name)",
        prompt: `1.context: Installed cables to support split trunk. Saved the tree. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "Arborist Consult (With Name)",
        prompt: `1.context: Certified arborist diagnosed fungus and treated it. Knowledgeable. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Tree Service",
        title: "General Cleanup (With Name)",
        prompt: `1.context: Left the yard cleaner than they found it. Great attention to detail. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // TREE SERVICE (NO NAME)
    // ============================================
    {
        category: "Tree Service",
        title: "Tree Removal (No Name)",
        prompt: `1.context: Removed large oak tree near house. Used crane. Safe and efficient. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Stump Grinding (No Name)",
        prompt: `1.context: Ground stump well below grade. Clened up all wood chips. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Trimming (No Name)",
        prompt: `1.context: Trimmed overgrown branches. Tree looks healthier and safer. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Emergency Storm (No Name)",
        prompt: `1.context: Tree fell on driveway during storm. Came out immediately to clear it. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Lot Clearing (No Name)",
        prompt: `1.context: Cleared lot for new construction. Fast and thorough. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Deadwood Removal (No Name)",
        prompt: `1.context: Removed dangerous dead limbs over the roof. Professional crew. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Palm Trimming (No Name)",
        prompt: `1.context: Cleaned up palm trees. Removed seed pods and dead fronds. 2.word limit: 20-30 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Cabling (No Name)",
        prompt: `1.context: Installed cables to support split trunk. Saved the tree. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "Arborist Consult (No Name)",
        prompt: `1.context: Certified arborist diagnosed fungus and treated it. Knowledgeable. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Tree Service",
        title: "General Cleanup (No Name)",
        prompt: `1.context: Left the yard cleaner than they found it. Great attention to detail. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // RUG STORE (WITH NAME)
    // ============================================
    {
        category: "Rug Store",
        title: "Persian Rug (With Name)",
        prompt: `1.context: Bought a hand-knotted Persian rug. Stunning colors and quality. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Rug Cleaning (With Name)",
        prompt: `1.context: Cleaned my old wool rug. Removed pet stains completely. Looks new. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Repair/Restoration (With Name)",
        prompt: `1.context: Fixed frayed edges on my antique rug. Invisible repair. Skilled work. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Custom Pad (With Name)",
        prompt: `1.context: Cut a custom non-slip pad. Rug stays perfectly in place now. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Modern Rug (With Name)",
        prompt: `1.context: Purchased a modern abstract rug. Ties the whole living room together. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Home Trial (With Name)",
        prompt: `1.context: Let me try 3 rugs at home before deciding. Very helpful service. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Great Value (With Name)",
        prompt: `1.context: Better prices than department stores. High quality for the cost. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Stair Runner (With Name)",
        prompt: `1.context: Installed a beautiful runner on our stairs. Professional installation. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Silk Rug (With Name)",
        prompt: `1.context: Bought a luxurious silk blend rug. It is so soft and elegant. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Rug Store",
        title: "Appraisal (With Name)",
        prompt: `1.context: Appraised my inherited rug. Very knowledgeable and honest. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },

    // ============================================
    // RUG STORE (NO NAME)
    // ============================================
    {
        category: "Rug Store",
        title: "Persian Rug (No Name)",
        prompt: `1.context: Bought a hand-knotted Persian rug. Stunning colors and quality. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Rug Cleaning (No Name)",
        prompt: `1.context: Cleaned my old wool rug. Removed pet stains completely. Looks new. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Repair/Restoration (No Name)",
        prompt: `1.context: Fixed frayed edges on my antique rug. Invisible repair. Skilled work. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Custom Pad (No Name)",
        prompt: `1.context: Cut a custom non-slip pad. Rug stays perfectly in place now. 2.word limit: 25-30 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Modern Rug (No Name)",
        prompt: `1.context: Purchased a modern abstract rug. Ties the whole living room together. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Home Trial (No Name)",
        prompt: `1.context: Let me try 3 rugs at home before deciding. Very helpful service. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Great Value (No Name)",
        prompt: `1.context: Better prices than department stores. High quality for the cost. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Stair Runner (No Name)",
        prompt: `1.context: Installed a beautiful runner on our stairs. Professional installation. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Silk Rug (No Name)",
        prompt: `1.context: Bought a luxurious silk blend rug. It is so soft and elegant. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Rug Store",
        title: "Appraisal (No Name)",
        prompt: `1.context: Appraised my inherited rug. Very knowledgeable and honest. 2.word limit: 30-40 3.name include in reviewtex: no`
    },

    // ============================================
    // PLASTERER (WITH NAME)
    // ============================================
    {
        category: "Plasterer",
        title: "Wall Skimming (With Name)",
        prompt: `1.context: Skimmed old artex ceilings to smooth finish. Looks modern and perfect. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Render Repair (With Name)",
        prompt: `1.context: Repaired cracked external render. Matched the texture perfectly. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "New Ceiling (With Name)",
        prompt: `1.context: Boarded and plastered new suspended ceiling. Clean and flat. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Damp Proofing (With Name)",
        prompt: `1.context: Treated rising damp and replastered. Very professional and tidy. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Drywall Tape & Joint (With Name)",
        prompt: `1.context: Taped and jointed new partition wall. Ready for painting immediately. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Cornice Repair (With Name)",
        prompt: `1.context: Restored damaged Victorian cornice. Incredible craftsmanship. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Whole Room (With Name)",
        prompt: `1.context: Plastered entire living room renovation. Smooth as glass. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Patch Repair (With Name)",
        prompt: `1.context: Patched holes left by electricians. Can't see where they were. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Venetian Plaster (With Name)",
        prompt: `1.context: Applied polished Venetian plaster feature wall. Stunning marble effect. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Plasterer",
        title: "Cleanliness (With Name)",
        prompt: `1.context: Protected carpets and cleaned up everything. No mess left behind. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // PLASTERER (NO NAME)
    // ============================================
    {
        category: "Plasterer",
        title: "Wall Skimming (No Name)",
        prompt: `1.context: Skimmed old artex ceilings to smooth finish. Looks modern and perfect. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Render Repair (No Name)",
        prompt: `1.context: Repaired cracked external render. Matched the texture perfectly. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "New Ceiling (No Name)",
        prompt: `1.context: Boarded and plastered new suspended ceiling. Clean and flat. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Damp Proofing (No Name)",
        prompt: `1.context: Treated rising damp and replastered. Very professional and tidy. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Drywall Tape & Joint (No Name)",
        prompt: `1.context: Taped and jointed new partition wall. Ready for painting immediately. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Cornice Repair (No Name)",
        prompt: `1.context: Restored damaged Victorian cornice. Incredible craftsmanship. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Whole Room (No Name)",
        prompt: `1.context: Plastered entire living room renovation. Smooth as glass. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Patch Repair (No Name)",
        prompt: `1.context: Patched holes left by electricians. Can't see where they were. 2.word limit: 25-30 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Venetian Plaster (No Name)",
        prompt: `1.context: Applied polished Venetian plaster feature wall. Stunning marble effect. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Plasterer",
        title: "Cleanliness (No Name)",
        prompt: `1.context: Protected carpets and cleaned up everything. No mess left behind. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // PLUMBER (WITH NAME)
    // ============================================
    {
        category: "Plumber",
        title: "Emergency Burst Pipe (With Name)",
        prompt: `1.context: Pipe burst at 2 AM. Arrived in 30 mins. Saved the basement from flooding. 2.word limit: 30-45 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Water Heater Replace (With Name)",
        prompt: `1.context: Installed tankless water heater. Endless hot water now. Clean install. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Clogged Drain (With Name)",
        prompt: `1.context: Kitchen sink totally clogged. Snaked it out quickly. Flowing freely now. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Toilet Repair (With Name)",
        prompt: `1.context: Toilet was running constantly. Replaced internal parts. Fixed right the first time. 2.word limit: 20-30 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Sewer Line (With Name)",
        prompt: `1.context: Excavated and replaced sewer line. Reseeded the grass after. Hard working crew. 2.word limit: 50-60 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Faucet Install (With Name)",
        prompt: `1.context: Installed new master bath faucets. Looks modern and updated. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Sump Pump (With Name)",
        prompt: `1.context: Replaced old sump pump. Tested it thoroughly. Ready for rain. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Gas Line (With Name)",
        prompt: `1.context: Ran gas line for new stove. Pressure tested safety. Certified and thorough. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Leak Detection (With Name)",
        prompt: `1.context: Found a hidden leak behind wall. Minimal damage to fix. Advanced equipment. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Plumber",
        title: "Water Filtration (With Name)",
        prompt: `1.context: Installed whole house filter. Water tastes great now. Better water quality. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },

    // ============================================
    // PLUMBER (NO NAME)
    // ============================================
    {
        category: "Plumber",
        title: "Emergency Burst Pipe (No Name)",
        prompt: `1.context: Pipe burst at 2 AM. Arrived in 30 mins. Saved the basement from flooding. 2.word limit: 30-45 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Water Heater Replace (No Name)",
        prompt: `1.context: Installed tankless water heater. Endless hot water now. Clean install. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Clogged Drain (No Name)",
        prompt: `1.context: Kitchen sink totally clogged. Snaked it out quickly. Flowing freely now. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Toilet Repair (No Name)",
        prompt: `1.context: Toilet was running constantly. Replaced internal parts. Fixed right the first time. 2.word limit: 20-30 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Sewer Line (No Name)",
        prompt: `1.context: Excavated and replaced sewer line. Reseeded the grass after. Hard working crew. 2.word limit: 50-60 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Faucet Install (No Name)",
        prompt: `1.context: Installed new master bath faucets. Looks modern and updated. 2.word limit: 25-30 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Sump Pump (No Name)",
        prompt: `1.context: Replaced old sump pump. Tested it thoroughly. Ready for rain. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Gas Line (No Name)",
        prompt: `1.context: Ran gas line for new stove. Pressure tested safety. Certified and thorough. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Leak Detection (No Name)",
        prompt: `1.context: Found a hidden leak behind wall. Minimal damage to fix. Advanced equipment. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Plumber",
        title: "Water Filtration (No Name)",
        prompt: `1.context: Installed whole house filter. Water tastes great now. Better water quality. 2.word limit: 30-40 3.name include in reviewtex: no`
    },

    // ============================================
    // EARTH WORKS (WITH NAME)
    // ============================================
    {
        category: "Earth Works",
        title: "Grading (With Name)",
        prompt: `1.context: Regraded my backyard for better drainage. No more standing water. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Foundation Dig (With Name)",
        prompt: `1.context: Excavated for a new home addition. Precision digging. Clean site. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Gravel Driveway (With Name)",
        prompt: `1.context: Installed a new gravel driveway. Rolled it smooth. Looks great. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Land Clearing (With Name)",
        prompt: `1.context: Cleared thick brush and stumps from my lot. Fast and efficient. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Utility Trenching (With Name)",
        prompt: `1.context: Dug a trench for new electrical line. Neat and safe work. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Septic Install (With Name)",
        prompt: `1.context: Installed a complete new septic system. Passed inspection easily. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Demolition (With Name)",
        prompt: `1.context: Demolished an old shed and hauled it away. Left the ground flat. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Erosion Control (With Name)",
        prompt: `1.context: Fixed a hillside erosion problem. Stabilized the ground. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Pool Excavation (With Name)",
        prompt: `1.context: Dug the hole for our new pool. Perfect dimensions. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Earth Works",
        title: "Retaining Wall Prep (With Name)",
        prompt: `1.context: Dug footings for a large retaining wall. Ready to build. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // EARTH WORKS (NO NAME)
    // ============================================
    {
        category: "Earth Works",
        title: "Grading (No Name)",
        prompt: `1.context: Regraded my backyard for better drainage. No more standing water. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Foundation Dig (No Name)",
        prompt: `1.context: Excavated for a new home addition. Precision digging. Clean site. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Gravel Driveway (No Name)",
        prompt: `1.context: Installed a new gravel driveway. Rolled it smooth. Looks great. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Land Clearing (No Name)",
        prompt: `1.context: Cleared thick brush and stumps from my lot. Fast and efficient. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Utility Trenching (No Name)",
        prompt: `1.context: Dug a trench for new electrical line. Neat and safe work. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Septic Install (No Name)",
        prompt: `1.context: Installed a complete new septic system. Passed inspection easily. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Demolition (No Name)",
        prompt: `1.context: Demolished an old shed and hauled it away. Left the ground flat. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Erosion Control (No Name)",
        prompt: `1.context: Fixed a hillside erosion problem. Stabilized the ground. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Pool Excavation (No Name)",
        prompt: `1.context: Dug the hole for our new pool. Perfect dimensions. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Earth Works",
        title: "Retaining Wall Prep (No Name)",
        prompt: `1.context: Dug footings for a large retaining wall. Ready to build. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // CHARPENTIER (WITH NAME)
    // ============================================
    {
        category: "Charpentier",
        title: "Roof Framing (With Name)",
        prompt: `1.context: Built the entire roof frame for our new house. Solid and precise wood work. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Wooden Terrace (With Name)",
        prompt: `1.context: Built a large custom wooden deck/terrace. Beautiful finish and sturdy. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Carport Build (With Name)",
        prompt: `1.context: Constructed a custom wooden carport. Fits two cars perfectly. Great craftsmanship. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Attic Conversion (With Name)",
        prompt: `1.context: Modified roof trusses to create living space in attic. Expert structural work. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Exposed Beams (With Name)",
        prompt: `1.context: Installed decorative exposed wooden beams in the living room. Adds so much character. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Custom Staircase (With Name)",
        prompt: `1.context: Crafted a bespoke wooden staircase. It is a work of art. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Garden Studio (With Name)",
        prompt: `1.context: Built a wooden garden office/studio. Warm and well insulated. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Structural Repair (With Name)",
        prompt: `1.context: Reinforced sagging old roof beams. Safety is restored. Very professional. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Wood Cladding (With Name)",
        prompt: `1.context: Installed exterior wood siding (bardage). The house looks completely transformed. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Charpentier",
        title: "Gazebo/Pergola (With Name)",
        prompt: `1.context: Built a custom pergola for shade. Perfect joinery work. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // CHARPENTIER (NO NAME)
    // ============================================
    {
        category: "Charpentier",
        title: "Roof Framing (No Name)",
        prompt: `1.context: Built the entire roof frame for our new house. Solid and precise wood work. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Wooden Terrace (No Name)",
        prompt: `1.context: Built a large custom wooden deck/terrace. Beautiful finish and sturdy. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Carport Build (No Name)",
        prompt: `1.context: Constructed a custom wooden carport. Fits two cars perfectly. Great craftsmanship. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Attic Conversion (No Name)",
        prompt: `1.context: Modified roof trusses to create living space in attic. Expert structural work. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Exposed Beams (No Name)",
        prompt: `1.context: Installed decorative exposed wooden beams in the living room. Adds so much character. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Custom Staircase (No Name)",
        prompt: `1.context: Crafted a bespoke wooden staircase. It is a work of art. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Garden Studio (No Name)",
        prompt: `1.context: Built a wooden garden office/studio. Warm and well insulated. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Structural Repair (No Name)",
        prompt: `1.context: Reinforced sagging old roof beams. Safety is restored. Very professional. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Wood Cladding (No Name)",
        prompt: `1.context: Installed exterior wood siding (bardage). The house looks completely transformed. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Charpentier",
        title: "Gazebo/Pergola (No Name)",
        prompt: `1.context: Built a custom pergola for shade. Perfect joinery work. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // WATERPROOFING SERVICE (WITH NAME)
    // ============================================
    {
        category: "Waterproofing",
        title: "Basement Sealing (With Name)",
        prompt: `1.context: Sealed my damp basement. No more musty smell or leaks. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Exterior Membrane (With Name)",
        prompt: `1.context: Applied waterproof membrane to foundation exterior. Very thorough excavation and seal. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Crack Injection (With Name)",
        prompt: `1.context: Injected epoxy into foundation cracks. Stopped the water ingress immediately. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Sump Pump Install (With Name)",
        prompt: `1.context: Installed a new sump pump and backup battery. Peace of mind during storms. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "French Drain (With Name)",
        prompt: `1.context: Installed an interior French drain system. Dry floor guarantee. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Crawl Space Encapsulation (With Name)",
        prompt: `1.context: Encapsulated the crawl space with heavy liner. Clean and dry now. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Mold Remediation (With Name)",
        prompt: `1.context: Removed mold caused by water damage and waterproofed the area. Safe air quality restored. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Balcony Waterproofing (With Name)",
        prompt: `1.context: Waterproofed leaking balcony. Protects the room below now. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Roof Deck (With Name)",
        prompt: `1.context: Sealed flat roof deck. High quality elastomeric coating used. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Waterproofing",
        title: "Dehumidifier System (With Name)",
        prompt: `1.context: Installed whole-home dehumidifier. Humidity levels are perfect. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // WATERPROOFING SERVICE (NO NAME)
    // ============================================
    {
        category: "Waterproofing",
        title: "Basement Sealing (No Name)",
        prompt: `1.context: Sealed my damp basement. No more musty smell or leaks. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Exterior Membrane (No Name)",
        prompt: `1.context: Applied waterproof membrane to foundation exterior. Very thorough excavation and seal. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Crack Injection (No Name)",
        prompt: `1.context: Injected epoxy into foundation cracks. Stopped the water ingress immediately. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Sump Pump Install (No Name)",
        prompt: `1.context: Installed a new sump pump and backup battery. Peace of mind during storms. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "French Drain (No Name)",
        prompt: `1.context: Installed an interior French drain system. Dry floor guarantee. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Crawl Space Encapsulation (No Name)",
        prompt: `1.context: Encapsulated the crawl space with heavy liner. Clean and dry now. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Mold Remediation (No Name)",
        prompt: `1.context: Removed mold caused by water damage and waterproofed the area. Safe air quality restored. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Balcony Waterproofing (No Name)",
        prompt: `1.context: Waterproofed leaking balcony. Protects the room below now. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Roof Deck (No Name)",
        prompt: `1.context: Sealed flat roof deck. High quality elastomeric coating used. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Waterproofing",
        title: "Dehumidifier System (No Name)",
        prompt: `1.context: Installed whole-home dehumidifier. Humidity levels are perfect. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // FAÇADIER (WITH NAME)
    // ============================================
    {
        category: "Façadier",
        title: "Facade Cleaning (With Name)",
        prompt: `1.context: High-pressure cleaned the entire building facade. Looks brand new. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Roughcasting/Crépi (With Name)",
        prompt: `1.context: Applied new roughcast render (crépi) to the house. Perfect finish and color. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "External Insulation (With Name)",
        prompt: `1.context: Installed external thermal insulation (ITE). House is much warmer now. 2.word limit: 40-50 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Crack Repair (With Name)",
        prompt: `1.context: Repaired deep cracks in the exterior walls. Structural integrity restored. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Painting (With Name)",
        prompt: `1.context: Repainted the exterior facade. Precision work, no drips. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Stone Pointing (With Name)",
        prompt: `1.context: Repointed old stone walls. Preserved the historic look beautifully. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Graffiti Removal (With Name)",
        prompt: `1.context: Removed years of graffiti from our shop front. Very effective service. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Render Renovation (With Name)",
        prompt: `1.context: Renovated crumbling render. The house looks modern again. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Water Repellent (With Name)",
        prompt: `1.context: Applied hydrofuge treatment to protect walls from rain. Invisible protection. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Façadier",
        title: "Wood Cladding Treat (With Name)",
        prompt: `1.context: Treated and stained exterior wood cladding. Restored its natural color. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },

    // ============================================
    // FAÇADIER (NO NAME)
    // ============================================
    {
        category: "Façadier",
        title: "Facade Cleaning (No Name)",
        prompt: `1.context: High-pressure cleaned the entire building facade. Looks brand new. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Roughcasting/Crépi (No Name)",
        prompt: `1.context: Applied new roughcast render (crépi) to the house. Perfect finish and color. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "External Insulation (No Name)",
        prompt: `1.context: Installed external thermal insulation (ITE). House is much warmer now. 2.word limit: 40-50 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Crack Repair (No Name)",
        prompt: `1.context: Repaired deep cracks in the exterior walls. Structural integrity restored. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Painting (No Name)",
        prompt: `1.context: Repainted the exterior facade. Precision work, no drips. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Stone Pointing (No Name)",
        prompt: `1.context: Repointed old stone walls. Preserved the historic look beautifully. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Graffiti Removal (No Name)",
        prompt: `1.context: Removed years of graffiti from our shop front. Very effective service. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Render Renovation (No Name)",
        prompt: `1.context: Renovated crumbling render. The house looks modern again. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Water Repellent (No Name)",
        prompt: `1.context: Applied hydrofuge treatment to protect walls from rain. Invisible protection. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Façadier",
        title: "Wood Cladding Treat (No Name)",
        prompt: `1.context: Treated and stained exterior wood cladding. Restored its natural color. 2.word limit: 30-40 3.name include in reviewtex: no`
    },

    // ============================================
    // HOME GOODS STORE (WITH NAME)
    // ============================================
    {
        category: "Home Goods Store",
        title: "Furniture Selection (With Name)",
        prompt: `1.context: Bought a new sofa and dining table. Huge selection and great quality. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Kitchenware (With Name)",
        prompt: `1.context: Found the perfect set of pots and pans. Better prices than online. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Decor Advice (With Name)",
        prompt: `1.context: Staff helped me choose throw pillows to match my curtains. Great eye for design. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Bedding (With Name)",
        prompt: `1.context: Purchased high thread count sheets. So soft and comfortable. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Lighting Fixtures (With Name)",
        prompt: `1.context: Bought a modern chandelier. It completely transformed the room. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Rug Collection (With Name)",
        prompt: `1.context: Found a beautiful area rug for the hallway. Durable and stylish. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Organization (With Name)",
        prompt: `1.context: Bought storage bins and organizers. My closet is finally tidy. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Customer Service (With Name)",
        prompt: `1.context: Returned an item without a receipt. They were very understanding and helpful. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Seasonal Decor (With Name)",
        prompt: `1.context: Best place for Christmas decorations. Everything is so festive and affordable. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Home Goods Store",
        title: "Tableware (With Name)",
        prompt: `1.context: Bought a full dinner set for 12. Elegant design and dishwasher safe. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // HOME GOODS STORE (NO NAME)
    // ============================================
    {
        category: "Home Goods Store",
        title: "Furniture Selection (No Name)",
        prompt: `1.context: Bought a new sofa and dining table. Huge selection and great quality. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Kitchenware (No Name)",
        prompt: `1.context: Found the perfect set of pots and pans. Better prices than online. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Decor Advice (No Name)",
        prompt: `1.context: Staff helped me choose throw pillows to match my curtains. Great eye for design. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Bedding (No Name)",
        prompt: `1.context: Purchased high thread count sheets. So soft and comfortable. 2.word limit: 25-30 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Lighting Fixtures (No Name)",
        prompt: `1.context: Bought a modern chandelier. It completely transformed the room. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Rug Collection (No Name)",
        prompt: `1.context: Found a beautiful area rug for the hallway. Durable and stylish. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Organization (No Name)",
        prompt: `1.context: Bought storage bins and organizers. My closet is finally tidy. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Customer Service (No Name)",
        prompt: `1.context: Returned an item without a receipt. They were very understanding and helpful. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Seasonal Decor (No Name)",
        prompt: `1.context: Best place for Christmas decorations. Everything is so festive and affordable. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Home Goods Store",
        title: "Tableware (No Name)",
        prompt: `1.context: Bought a full dinner set for 12. Elegant design and dishwasher safe. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // GARDENER (WITH NAME)
    // ============================================
    {
        category: "Gardener",
        title: "Lawn Mowing (With Name)",
        prompt: `1.context: Mowed my large lawn perfectly. Edging and cleanup were spotless. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Hedge Trimming (With Name)",
        prompt: `1.context: Trimmed overgrown hedges. They look neat and uniform now. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Garden Design (With Name)",
        prompt: `1.context: Designed a new flower bed layout. The colors and plants are beautiful. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Weeding (With Name)",
        prompt: `1.context: Removed all weeds from my driveway and beds. Very thorough job. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Planting (With Name)",
        prompt: `1.context: Planted 10 new trees and shrubs. Gave great advice on care. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Spring Cleanup (With Name)",
        prompt: `1.context: Cleared all winter debris and prepared garden for spring. Great start to the season. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Turfing/Sodding (With Name)",
        prompt: `1.context: Laid new turf in the backyard. The grass is green and healthy. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Pruning (With Name)",
        prompt: `1.context: Pruned my rose bushes and fruit trees. Professional and knowledgeable. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Irrigation Install (With Name)",
        prompt: `1.context: Installed a drip irrigation system. Saves water and plants are thriving. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Gardener",
        title: "Mulching (With Name)",
        prompt: `1.context: Spread new mulch in all flower beds. Looks fresh and tidy. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // GARDENER (NO NAME)
    // ============================================
    {
        category: "Gardener",
        title: "Lawn Mowing (No Name)",
        prompt: `1.context: Mowed my large lawn perfectly. Edging and cleanup were spotless. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Hedge Trimming (No Name)",
        prompt: `1.context: Trimmed overgrown hedges. They look neat and uniform now. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Garden Design (No Name)",
        prompt: `1.context: Designed a new flower bed layout. The colors and plants are beautiful. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Weeding (No Name)",
        prompt: `1.context: Removed all weeds from my driveway and beds. Very thorough job. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Planting (No Name)",
        prompt: `1.context: Planted 10 new trees and shrubs. Gave great advice on care. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Spring Cleanup (No Name)",
        prompt: `1.context: Cleared all winter debris and prepared garden for spring. Great start to the season. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Turfing/Sodding (No Name)",
        prompt: `1.context: Laid new turf in the backyard. The grass is green and healthy. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Pruning (No Name)",
        prompt: `1.context: Pruned my rose bushes and fruit trees. Professional and knowledgeable. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Irrigation Install (No Name)",
        prompt: `1.context: Installed a drip irrigation system. Saves water and plants are thriving. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Gardener",
        title: "Mulching (No Name)",
        prompt: `1.context: Spread new mulch in all flower beds. Looks fresh and tidy. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // MOVING COMPANY (WITH NAME)
    // ============================================
    {
        category: "Moving Company",
        title: "Full Service Move (With Name)",
        prompt: `1.context: Packed, moved, and unpacked everything. Stress-free experience. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Long Distance (With Name)",
        prompt: `1.context: Moved us across the country. Everything arrived on time and intact. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Local Move (With Name)",
        prompt: `1.context: Short move within the same city. Fast, efficient, and friendly crew. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Office Move (With Name)",
        prompt: `1.context: Relocated our entire office over the weekend. Ready to work Monday morning. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Piano Moving (With Name)",
        prompt: `1.context: Moved our grand piano safely. Very specialized and careful handling. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Packing Service (With Name)",
        prompt: `1.context: They packed our entire house in one day. Labeled everything clearly. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Storage Solutions (With Name)",
        prompt: `1.context: Stored our furniture for a month between moves. Secure and clean facility. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Last Minute Move (With Name)",
        prompt: `1.context: Accommodated us on short notice when other movers canceled. Lifesavers. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Senior Move (With Name)",
        prompt: `1.context: Helped my parents downsize. Very patient and respectful crew. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Moving Company",
        title: "Appliance Moving (With Name)",
        prompt: `1.context: Moved heavy appliances including washer, dryer, and fridge. No scratches. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },

    // ============================================
    // MOVING COMPANY (NO NAME)
    // ============================================
    {
        category: "Moving Company",
        title: "Full Service Move (No Name)",
        prompt: `1.context: Packed, moved, and unpacked everything. Stress-free experience. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Long Distance (No Name)",
        prompt: `1.context: Moved us across the country. Everything arrived on time and intact. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Local Move (No Name)",
        prompt: `1.context: Short move within the same city. Fast, efficient, and friendly crew. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Office Move (No Name)",
        prompt: `1.context: Relocated our entire office over the weekend. Ready to work Monday morning. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Piano Moving (No Name)",
        prompt: `1.context: Moved our grand piano safely. Very specialized and careful handling. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Packing Service (No Name)",
        prompt: `1.context: They packed our entire house in one day. Labeled everything clearly. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Storage Solutions (No Name)",
        prompt: `1.context: Stored our furniture for a month between moves. Secure and clean facility. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Last Minute Move (No Name)",
        prompt: `1.context: Accommodated us on short notice when other movers canceled. Lifesavers. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Senior Move (No Name)",
        prompt: `1.context: Helped my parents downsize. Very patient and respectful crew. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Moving Company",
        title: "Appliance Moving (No Name)",
        prompt: `1.context: Moved heavy appliances including washer, dryer, and fridge. No scratches. 2.word limit: 25-35 3.name include in reviewtex: no`
    },

    // ============================================
    // PAINTER (WITH NAME)
    // ============================================
    {
        category: "Painter",
        title: "Interior Paint (With Name)",
        prompt: `1.context: Painted the whole interior. Crisp lines and smooth finish. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Exterior Paint (With Name)",
        prompt: `1.context: Painted the exterior of our house. It looks brand new. Great curb appeal. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Cabinet Refinishing (With Name)",
        prompt: `1.context: Refinished our kitchen cabinets. Factory-like quality. Saved us a fortune. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Wallpaper Removal (With Name)",
        prompt: `1.context: Removed layers of old wallpaper and skimmed the walls. Ready for paint. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Deck Staining (With Name)",
        prompt: `1.context: Stained and sealed our deck. Beautiful color and protection from weather. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Fence Painting (With Name)",
        prompt: `1.context: Painted our privacy fence. Fast efficient and shielded plants. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Commercial Painting (With Name)",
        prompt: `1.context: Painted our office space. Worked after hours to avoid disruption. 2.word limit: 35-45 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Trim & Doors (With Name)",
        prompt: `1.context: Painted all trim and doors in the house. High gloss finish is perfect. 2.word limit: 30-40 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Color Consultation (With Name)",
        prompt: `1.context: Helped us choose the perfect color palette. We love the new look. 2.word limit: 25-35 3.name include in reviewtex: yes`
    },
    {
        category: "Painter",
        title: "Plaster Repair (With Name)",
        prompt: `1.context: Repaired plaster cracks before painting. Seamless finish. 2.word limit: 25-30 3.name include in reviewtex: yes`
    },

    // ============================================
    // PAINTER (NO NAME)
    // ============================================
    {
        category: "Painter",
        title: "Interior Paint (No Name)",
        prompt: `1.context: Painted the whole interior. Crisp lines and smooth finish. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Exterior Paint (No Name)",
        prompt: `1.context: Painted the exterior of our house. It looks brand new. Great curb appeal. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Cabinet Refinishing (No Name)",
        prompt: `1.context: Refinished our kitchen cabinets. Factory-like quality. Saved us a fortune. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Wallpaper Removal (No Name)",
        prompt: `1.context: Removed layers of old wallpaper and skimmed the walls. Ready for paint. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Deck Staining (No Name)",
        prompt: `1.context: Stained and sealed our deck. Beautiful color and protection from weather. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Fence Painting (No Name)",
        prompt: `1.context: Painted our privacy fence. Fast efficient and shielded plants. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Commercial Painting (No Name)",
        prompt: `1.context: Painted our office space. Worked after hours to avoid disruption. 2.word limit: 35-45 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Trim & Doors (No Name)",
        prompt: `1.context: Painted all trim and doors in the house. High gloss finish is perfect. 2.word limit: 30-40 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Color Consultation (No Name)",
        prompt: `1.context: Helped us choose the perfect color palette. We love the new look. 2.word limit: 25-35 3.name include in reviewtex: no`
    },
    {
        category: "Painter",
        title: "Plaster Repair (No Name)",
        prompt: `1.context: Repaired plaster cracks before painting. Seamless finish. 2.word limit: 25-30 3.name include in reviewtex: no`
    }
];
