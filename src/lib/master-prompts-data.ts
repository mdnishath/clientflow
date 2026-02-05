
export interface MasterPrompt {
    category: string;
    title: string;
    prompt: string;
}

export const MASTER_PROMPTS_DATA: MasterPrompt[] = [
    // ============================================
    // 1. ROOFING
    // ============================================
    { category: "Roofing", title: "Full Replacement", prompt: `Context: Replaced old shingle roof. Finished in 2 days. Crew was polite.\nWord Limit: 50-70 words\nInstructions: Detailed review. Mention "finished ahead of schedule", "fair pricing", and "clean job site".` },
    { category: "Roofing", title: "Leak Repair", prompt: `Context: Fixed a leaking spot after heavy rain. Diagnosed quickly.\nWord Limit: 30-40 words\nInstructions: Focus on diagnostic skill. Mention "honest assessment" and "quick repair".` },
    { category: "Roofing", title: "Storm Damage", prompt: `Context: Roof damaged by storm wind. They tarped it immediately and fixed it next day.\nWord Limit: 40-50 words\nInstructions: Focus on emergency response. Mention "lifesavers" and "rapid response".` },
    { category: "Roofing", title: "Metal Roof", prompt: `Context: Installed new metal roof on barn. Looks amazing. Long warranty.\nWord Limit: 30-40 words\nInstructions: Praise durability. Mention "quality craftsmanship" and "great warranty".` },
    { category: "Roofing", title: "Flat Roof Coating", prompt: `Context: Recoated commercial flat roof. Extended life of roof.\nWord Limit: 35-45 words\nInstructions: B2B focus. Mention "cost-effective solution" and "minimal disruption".` },
    { category: "Roofing", title: "Gutter & Fascia", prompt: `Context: Replaced rotting fascia and new gutters. House looks new.\nWord Limit: 30-40 words\nInstructions: Aesthetic focus. Mention "curb appeal" and "attention to detail".` },
    { category: "Roofing", title: "Skylight Install", prompt: `Context: Installed 2 skylights. No leaks. Great natural light.\nWord Limit: 25-35 words\nInstructions: Feature focus. Mention "natural light" and "leak-free".` },
    { category: "Roofing", title: "Chimney Flashing", prompt: `Context: Fixed leak around chimney. Matched shingles perfectly.\nWord Limit: 25-30 words\nInstructions: Specific fix. Mention "problem solved".` },
    { category: "Roofing", title: "Annual Inspection", prompt: `Context: Yearly roof checkup. Found loose shingles and fixed for cheap.\nWord Limit: 30-40 words\nInstructions: Trust focus. Mention "preventative maintenance" and "honest".` },
    { category: "Roofing", title: "General Service", prompt: `Context: Great experience from quote to cleanup. Highly professional.\nWord Limit: 30-45 words\nInstructions: General praise. Mention "smooth process" and "great communication".` },

    // ============================================
    // 2. PLUMBER
    // ============================================
    { category: "Plumber", title: "Emergency Burst Pipe", prompt: `Context: Pipe burst at 2 AM. Arrived in 30 mins. Saved the basement from flooding.\nWord Limit: 30-45 words\nInstructions: Emergency focus. Mention "24/7 service" and "fast arrival".` },
    { category: "Plumber", title: "Water Heater", prompt: `Context: Installed tankless water heater. Endless hot water now. Clean install.\nWord Limit: 40-50 words\nInstructions: Upgrade focus. Mention "energy efficient" and "neat work".` },
    { category: "Plumber", title: "Clogged Drain", prompt: `Context: Kitchen sink totally clogged. Snaked it out quickly.\nWord Limit: 25-35 words\nInstructions: Problem/Solution. Mention "flowing freely" and "fair price".` },
    { category: "Plumber", title: "Toilet Repair", prompt: `Context: Toilet was running constantly. Replaced internal parts.\nWord Limit: 20-30 words\nInstructions: Quick fix. Mention "fixed right the first time".` },
    { category: "Plumber", title: "Sewer Line", prompt: `Context: Excavated and replaced sewer line. Reseeded the grass after.\nWord Limit: 50-60 words\nInstructions: Major job. Mention "respectful of property" and "hard working".` },
    { category: "Plumber", title: "Faucet Install", prompt: `Context: Installed new master bath faucets. Looks modern.\nWord Limit: 25-30 words\nInstructions: Aesthetic. Mention "updated look".` },
    { category: "Plumber", title: "Sump Pump", prompt: `Context: Replaced old sump pump. Tested it thoroughly.\nWord Limit: 30-40 words\nInstructions: Peace of mind. Mention "ready for rain".` },
    { category: "Plumber", title: "Gas Line", prompt: `Context: Ran gas line for new stove. Pressure tested safety.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "certified" and "thorough".` },
    { category: "Plumber", title: "Leak Detection", prompt: `Context: Found a hidden leak behind wall. Minimal damage to fix.\nWord Limit: 35-45 words\nInstructions: Tech skill. Mention "advanced equipment" and "pinpointed the issue".` },
    { category: "Plumber", title: "Water Filtration", prompt: `Context: Installed whole house filter. Water tastes great now.\nWord Limit: 30-40 words\nInstructions: Health. Mention "better water quality".` },

    // ============================================
    // 3. ELECTRICIAN
    // ============================================
    { category: "Electrician", title: "Panel Upgrade", prompt: `Context: Upgraded to 200amp service. Labeled everything. Code compliant.\nWord Limit: 40-50 words\nInstructions: Professionalism. Mention "clean work" and "passed inspection".` },
    { category: "Electrician", title: "EV Charger", prompt: `Context: Installed Tesla wall charger in garage. Clean conduit run.\nWord Limit: 30-40 words\nInstructions: Modern tech. Mention "EV ready" and "fast install".` },
    { category: "Electrician", title: "Recessed Lighting", prompt: `Context: Installed can lights in living room. Dimmers work great.\nWord Limit: 30-40 words\nInstructions: Aesthetic. Mention "room transformation".` },
    { category: "Electrician", title: "Outlets/Switches", prompt: `Context: Replaced old beige outlets with white decent style.\nWord Limit: 20-30 words\nInstructions: Update. Mention "modern look".` },
    { category: "Electrician", title: "Ceiling Fan", prompt: `Context: Installed fan on high ceiling. No wobble.\nWord Limit: 25-35 words\nInstructions: Skill. Mention "solid install".` },
    { category: "Electrician", title: "Troubleshooting", prompt: `Context: Power kept tripping in kitchen. Found a loose neutral. Fixed fast.\nWord Limit: 35-45 words\nInstructions: Diagnostic. Mention "expert troubleshooting".` },
    { category: "Electrician", title: "Outdoor Power", prompt: `Context: Ran power to shed/pool. Trenched neatly.\nWord Limit: 30-40 words\nInstructions: Outdoor work. Mention "neat trenching".` },
    { category: "Electrician", title: "Generator Hookup", prompt: `Context: Installed transfer switch for portable generator. Explained how to use.\nWord Limit: 40-50 words\nInstructions: Safety/Education. Mention "ready for storms".` },
    { category: "Electrician", title: "Smoke Detectors", prompt: `Context: Hardwired new smoke/CO detectors throughout house.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "peace of mind".` },
    { category: "Electrician", title: "Hot Tub Install", prompt: `Context: Wired up new hot tub. Handled permitting.\nWord Limit: 30-40 words\nInstructions: Project. Mention "professional hookup".` },

    // ============================================
    // 4. HVAC
    // ============================================
    { category: "HVAC", title: "AC Repair", prompt: `Context: AC stopped cooling in heatwave. Fixed capacitor same day.\nWord Limit: 30-40 words\nInstructions: Relief. Mention "cool house" and "lifesaver".` },
    { category: "HVAC", title: "New Furnace", prompt: `Context: Installed high efficiency furnace. House heats up faster now.\nWord Limit: 40-50 words\nInstructions: Efficiency. Mention "warm and cozy" and "lower bills".` },
    { category: "HVAC", title: "Tune-Up", prompt: `Context: Seasonal maintenance. Checked freon and cleaned coils.\nWord Limit: 25-35 words\nInstructions: Preventative. Mention "thorough check".` },
    { category: "HVAC", title: "Duct Cleaning", prompt: `Context: Cleaned air ducts. Removed construction dust. Air smells better.\nWord Limit: 30-40 words\nInstructions: Health. Mention "better air quality".` },
    { category: "HVAC", title: "Thermostat", prompt: `Context: Installed Smart Thermostat. Showed me the app features.\nWord Limit: 25-35 words\nInstructions: Tech. Mention "smart control".` },
    { category: "HVAC", title: "Heat Pump", prompt: `Context: Installed mini-split heat pump in garage. Works great.\nWord Limit: 30-40 words\nInstructions: Solution. Mention "perfect temp".` },
    { category: "HVAC", title: "Emergency Service", prompt: `Context: Heater died on Sunday. Came out within 2 hours.\nWord Limit: 35-45 words\nInstructions: Availability. Mention "weekend service".` },
    { category: "HVAC", title: "Boiler Repair", prompt: `Context: Fixed radiators that weren't getting hot. Bled the system.\nWord Limit: 30-40 words\nInstructions: Knowledge. Mention "radiator expert".` },
    { category: "HVAC", title: "Commercial HVAC", prompt: `Context: Serviced our office roof units. Professional and timely.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "reliable partner".` },
    { category: "HVAC", title: "Quiet System", prompt: `Context: Replaced loud outdoor unit. New one is silent.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "whisper quiet".` },

    // ============================================
    // 5. TREE SERVICE
    // ============================================
    { category: "Tree Service", title: "Tree Removal", prompt: `Context: Removed dead oak. Used crane. Safe and clean.\nWord Limit: 40-50 words\nInstructions: Safety. Mention "precision work".` },
    { category: "Tree Service", title: "Stump Grinding", prompt: `Context: Ground stump below grade. Mulched the hole.\nWord Limit: 25-35 words\nInstructions: Cleanup. Mention "like it was never there".` },
    { category: "Tree Service", title: "Pruning", prompt: `Context: Trimmed canopy for structural health. Looks great.\nWord Limit: 30-40 words\nInstructions: Aesthetic. Mention "knows trer biology".` },
    { category: "Tree Service", title: "Storm Cleanup", prompt: `Context: Cleared fallen branch from driveway. Fast response.\nWord Limit: 30-40 words\nInstructions: Emergency. Mention "fast help".` },
    { category: "Tree Service", title: "Lot Clearing", prompt: `Context: Cleared lot for building. Fast and efficient machine work.\nWord Limit: 35-45 words\nInstructions: Project. Mention "cleared perfectly".` },
    { category: "Tree Service", title: "Deadwooding", prompt: `Context: Removed dangerous dead limbs over house.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "peace of mind".` },
    { category: "Tree Service", title: "Palm Trimming", prompt: `Context: Trimmed palms. Removed seed pods.\nWord Limit: 20-30 words\nInstructions: Cleanliness. Mention "neat job".` },
    { category: "Tree Service", title: "Cabling", prompt: `Context: Installed support cable for split trunk.\nWord Limit: 30-40 words\nInstructions: Preservation. Mention "saved the tree".` },
    { category: "Tree Service", title: "Planting", prompt: `Context: Planted 3 large maples. Staked them properly.\nWord Limit: 30-40 words\nInstructions: New growth. Mention "beautiful trees".` },
    { category: "Tree Service", title: "Arborist Consult", prompt: `Context: Diagnosed tree fungus. Prescribed treatment.\nWord Limit: 35-45 words\nInstructions: Expertise. Mention "certified arborist".` },

    // ============================================
    // 6. LANDSCAPING
    // ============================================
    { category: "Landscaping", title: "Lawn Mowing", prompt: `Context: Weekly service. Always neat. Edging is crisp.\nWord Limit: 25-35 words\nInstructions: Reliability. Mention "consistent".` },
    { category: "Landscaping", title: "Spring Cleanup", prompt: `Context: Mulched beds, trimmed bushes. Yard ready for summer.\nWord Limit: 35-45 words\nInstructions: Transformation. Mention "fresh look".` },
    { category: "Landscaping", title: "Patio Install", prompt: `Context: Installed paver patio. Level and beautiful design.\nWord Limit: 45-55 words\nInstructions: Hardscape. Mention "craftsmanship".` },
    { category: "Landscaping", title: "Sod Install", prompt: `Context: Laid new sod. Instant green lawn. Transformation.\nWord Limit: 30-40 words\nInstructions: Result. Mention "looks amazing".` },
    { category: "Landscaping", title: "Retaining Wall", prompt: `Context: Built stone retaining wall. Solved erosion issue.\nWord Limit: 40-50 words\nInstructions: Structural. Mention "solid build".` },
    { category: "Landscaping", title: "Irrigation Repair", prompt: `Context: Fixed broken sprinkler zones. Coverage is good now.\nWord Limit: 30-40 words\nInstructions: Maintenance. Mention "green lawn".` },
    { category: "Landscaping", title: "Landscape Design", prompt: `Context: Designed new front yard planting. Great use of color.\nWord Limit: 40-50 words\nInstructions: Design. Mention "artistic eye".` },
    { category: "Landscaping", title: "Fall Cleanup", prompt: `Context: Removed all leaves and cut back perennials.\nWord Limit: 25-35 words\nInstructions: Cleanup. Mention "spotless yard".` },
    { category: "Landscaping", title: "Mulching", prompt: `Context: Spread black mulch. Looks very sharp against green grass.\nWord Limit: 25-30 words\nInstructions: Aesthetic. Mention "curb appeal".` },
    { category: "Landscaping", title: "Water Feature", prompt: `Context: Installed small pond/fountain. Very relaxing.\nWord Limit: 30-40 words\nInstructions: Feature. Mention "zen atmosphere".` },

    // ============================================
    // 7. PEST CONTROL
    // ============================================
    { category: "Pest Control", title: "Ant Treatment", prompt: `Context: Kitchen had ants. Sprayed perimeter. Ants gone in 2 days.\nWord Limit: 30-40 words\nInstructions: Effectiveness. Mention "problem solved".` },
    { category: "Pest Control", title: "Termite Inspection", prompt: `Context: Annual inspection. Thorough check. No issues found.\nWord Limit: 25-35 words\nInstructions: Prevention. Mention "peace of mind".` },
    { category: "Pest Control", title: "Rodent Control", prompt: `Context:  Mice in attic. Sealed entry points and set traps.\nWord Limit: 35-45 words\nInstructions: Expertise. Mention "sealed everything".` },
    { category: "Pest Control", title: "Mosquito Spray", prompt: `Context: Monthly yard spray. Can finally sit outside again.\nWord Limit: 30-40 words\nInstructions: Lifestyle. Mention "enjoy the yard".` },
    { category: "Pest Control", title: "Wasp Nest", prompt: `Context: Removed huge hornet nest from eave. Safe removal.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "brave".` },
    { category: "Pest Control", title: "Bed Bug Heat", prompt: `Context: Heat treatment for bed bugs. Expensive but worked perfectly.\nWord Limit: 40-50 words\nInstructions: Solution. Mention "worth every penny".` },
    { category: "Pest Control", title: "Cockroaches", prompt: `Context: German roach problem. Baited effectively. Gone now.\nWord Limit: 30-40 words\nInstructions: Result. Mention "pest free".` },
    { category: "Pest Control", title: "Wildlife Removal", prompt: `Context: Trapped raccoon in garage. Relocated humanely.\nWord Limit: 35-45 words\nInstructions: Humane. Mention "humane treatment".` },
    { category: "Pest Control", title: "Quarterly Service", prompt: `Context: Regular service keeps bugs away. Always on time.\nWord Limit: 25-35 words\nInstructions: Consistency. Mention "reliable".` },
    { category: "Pest Control", title: "Flea Treatment", prompt: `Context: Fleas from dog. Sprayed house. Cycle broken.\nWord Limit: 30-40 words\nInstructions: Relief. Mention "relief for pets".` },

    // ============================================
    // 8. HOUSE CLEANING
    // ============================================
    { category: "House Cleaning", title: "Deep Clean", prompt: `Context: First time clean. Baseboards to fans. House sparkles.\nWord Limit: 35-45 words\nInstructions: Thoroughness. Mention "amazing detail".` },
    { category: "House Cleaning", title: "Move-Out", prompt: `Context: Cleaning for deposit return. Landlord approved.\nWord Limit: 30-40 words\nInstructions: Result. Mention "got deposit back".` },
    { category: "House Cleaning", title: "Bi-Weekly", prompt: `Context: Regular cleaning. Friendly crew. Trust them with key.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "reliable" and "consistent".` },
    { category: "House Cleaning", title: "Post-Reno", prompt: `Context: Cleaned up construction dust. Ready to move in.\nWord Limit: 35-45 words\nInstructions: Heavy duty. Mention "removed all dust".` },
    { category: "House Cleaning", title: "Kitchen Focus", prompt: `Context: Deep cleaned ovens and fridge. Look new again.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "spotless appliances".` },
    { category: "House Cleaning", title: "Bathroom Focus", prompt: `Context: Scrubbed grout and shower glass. Removing lime scale.\nWord Limit: 30-40 words\nInstructions: Result. Mention "shining".` },
    { category: "House Cleaning", title: "One-Off", prompt: `Context: Cleaning before hosting a party. Huge help.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "lifesaver".` },
    { category: "House Cleaning", title: "Green Cleaning", prompt: `Context: Used eco-friendly products. Safe for my pets.\nWord Limit: 30-40 words\nInstructions: Health. Mention "non-toxic".` },
    { category: "House Cleaning", title: "Organization", prompt: `Context: Helped organize pantry while cleaning. Very tidy.\nWord Limit: 30-40 words\nInstructions: Extra mile. Mention "organized".` },
    { category: "House Cleaning", title: "Holiday Clean", prompt: `Context: Pre-holiday cleaning. House ready for guests.\nWord Limit: 25-35 words\nInstructions: Hosting. Mention "guest ready".` },

    // ============================================
    // 9. CARPET CLEANING
    // ============================================
    { category: "Carpet Cleaning", title: "Pet Stains", prompt: `Context: Dog accident stains. Enzyme treatment worked. No smell.\nWord Limit: 30-40 words\nInstructions: Problem solve. Mention "odor gone".` },
    { category: "Carpet Cleaning", title: "Whole House", prompt: `Context: Steam cleaned 3 bedrooms. Carpets look lighter/cleaner.\nWord Limit: 30-40 words\nInstructions: Result. Mention "looks new".` },
    { category: "Carpet Cleaning", title: "Upholstery", prompt: `Context: Cleaned microfiber sofa. Removed food stains.\nWord Limit: 25-35 words\nInstructions: Furniture. Mention "fresh furniture".` },
    { category: "Carpet Cleaning", title: "Area Rugs", prompt: `Context: Cleaned wool area rug onsite. Vibrancy returned.\nWord Limit: 25-35 words\nInstructions: Care. Mention "colors popped".` },
    { category: "Carpet Cleaning", title: "Tile & Grout", prompt: `Context: Cleaned kitchen tile grout. Returned to original color.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "bright grout".` },
    { category: "Carpet Cleaning", title: "Drying Time", prompt: `Context: Carpets dried quickly. Not soaking wet for days.\nWord Limit: 25-35 words\nInstructions: Process. Mention "fast drying".` },
    { category: "Carpet Cleaning", title: "Stairs", prompt: `Context: Cleaned high traffic stairs. Removed dark path.\nWord Limit: 25-35 words\nInstructions: Heavy traffic. Mention "clean stairs".` },
    { category: "Carpet Cleaning", title: "Commercial", prompt: `Context: Cleaned office carpets over weekend. Ready for Monday.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "dry by monday".` },
    { category: "Carpet Cleaning", title: "Emergency", prompt: `Context: Spilled wine. Came out same day to spot clean.\nWord Limit: 25-35 words\nInstructions: Emergency. Mention "saved the carpet".` },
    { category: "Carpet Cleaning", title: "Deodorizing", prompt: `Context: House smells fresh, not like chemicals.\nWord Limit: 20-30 words\nInstructions: Scent. Mention "clean smell".` },

    // ============================================
    // 10. WINDOW CLEANING
    // ============================================
    { category: "Window Cleaning", title: "In & Out", prompt: `Context: Cleaned interior and exterior. Crystal clear.\nWord Limit: 25-35 words\nInstructions: Clarity. Mention "invisible glass".` },
    { category: "Window Cleaning", title: "Screens", prompt: `Context: Washed screens and tracks too. Very thorough.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "clean tracks".` },
    { category: "Window Cleaning", title: "High Rise/Ladder", prompt: `Context: 2nd story windows. Used ladders safely.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "hard to reach".` },
    { category: "Window Cleaning", title: "Skylights", prompt: `Context: Cleaned dirty skylights. Difference is night and day.\nWord Limit: 25-35 words\nInstructions: Result. Mention "more light".` },
    { category: "Window Cleaning", title: "Construction Clean", prompt: `Context: Removed stickers and paint overspray from new windows.\nWord Limit: 35-45 words\nInstructions: Heavy duty. Mention "scraped clean".` },
    { category: "Window Cleaning", title: "Storefront", prompt: `Context: Weekly clean for my shop. Always reliable.\nWord Limit: 20-30 words\nInstructions: B2B. Mention "sparkling display".` },
    { category: "Window Cleaning", title: "Mirrors", prompt: `Context: Cleaned large wall mirrors. Streak free.\nWord Limit: 20-30 words\nInstructions: Interior. Mention "streak free".` },
    { category: "Window Cleaning", title: "Solar Panels", prompt: `Context: Cleaned solar panels while up there. Efficiency up.\nWord Limit: 30-40 words\nInstructions: Add-on. Mention "energy production".` },
    { category: "Window Cleaning", title: "Hard Water", prompt: `Context: Removed hard water spots from sprinklers.\nWord Limit: 30-40 words\nInstructions: Restoration. Mention "looks new".` },
    { category: "Window Cleaning", title: "Rain Guarantee", prompt: `Context: Rained next day, they came back to touch up.\nWord Limit: 30-40 words\nInstructions: Service. Mention "great guarantee".` },

    // ============================================
    // 11. GUTTER CLEANING
    // ============================================
    { category: "Gutter Cleaning", title: "Fall Cleaning", prompt: `Context: Gutters stuffed with leaves. Bagged debris. clean flow.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "ready for winter".` },
    { category: "Gutter Cleaning", title: "Guard Install", prompt: `Context: Installed gutter guards. No more cleaning needed.\nWord Limit: 30-40 words\nInstructions: Upgrade. Mention "worth investment".` },
    { category: "Gutter Cleaning", title: "Minor Repair", prompt: `Context: Reattached loose downspout. Fixed sag.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "solid fix".` },
    { category: "Gutter Cleaning", title: "Before Storm", prompt: `Context: Came out before big rain. Prevented overflow.\nWord Limit: 30-40 words\nInstructions: Timing. Mention "prevented damage".` },
    { category: "Gutter Cleaning", title: "Cleanup", prompt: `Context: Blew off roof and cleaned up ground mess.\nWord Limit: 25-35 words\nInstructions: Cleanup. Mention "left no mess".` },
    { category: "Gutter Cleaning", title: "High Roof", prompt: `Context: 3 story house. Safety harnessed. Professional.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "safe methods".` },
    { category: "Gutter Cleaning", title: "Clog Removal", prompt: `Context: Downspout was impacted. Flushed it clear.\nWord Limit: 25-35 words\nInstructions: Function. Mention "flowing water".` },
    { category: "Gutter Cleaning", title: "Whitening", prompt: `Context: Scrubbed outside of gutters (tiger stripes). Look white again.\nWord Limit: 30-40 words\nInstructions: Aesthetic. Mention "looks painted".` },
    { category: "Gutter Cleaning", title: "Annual Contract", prompt: `Context: Sign up for 2x year. They just show up and do it.\nWord Limit: 30-40 words\nInstructions: Convenience. Mention "hassle free".` },
    { category: "Gutter Cleaning", title: "Underground Drains", prompt: `Context: Jetted the underground drain pipes. Flow restored.\nWord Limit: 35-45 words\nInstructions: Thoroughness. Mention "complete system".` },

    // ============================================
    // 12. PRESSURE WASHING
    // ============================================
    { category: "Pressure Washing", title: "Driveway", prompt: `Context: Cleaned oil stains/mold from concrete driveway. Bright white again.\nWord Limit: 30-40 words\nInstructions: Transformation. Mention "curb appeal".` },
    { category: "Pressure Washing", title: "House Wash", prompt: `Context: Soft wash vinyl siding. Removed green algae. Safe on paint.\nWord Limit: 35-45 words\nInstructions: Care. Mention "soft wash".` },
    { category: "Pressure Washing", title: "Deck Prep", prompt: `Context: Stripped old grey wood. Ready for stain.\nWord Limit: 30-40 words\nInstructions: Prep. Mention "wood restoration".` },
    { category: "Pressure Washing", title: "Pool Deck", prompt: `Context: Cleaned paver pool deck. Removed slippery mold.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "no longer slippery".` },
    { category: "Pressure Washing", title: "Roof Wash", prompt: `Context: Removed black streaks from shingles. Looks new.\nWord Limit: 35-45 words\nInstructions: Value. Mention "extended roof life".` },
    { category: "Pressure Washing", title: "Commercial", prompt: `Context: Cleaned dumpster pad and sidewalks for restaurant.\nWord Limit: 30-40 words\nInstructions: B2B. Mention "sanitary".` },
    { category: "Pressure Washing", title: "Fence", prompt: `Context: Washed wood fence. Looks brand new.\nWord Limit: 25-35 words\nInstructions: Aesthetic. Mention "restored".` },
    { category: "Pressure Washing", title: "Patio Furniture", prompt: `Context: Cleaned outdoor furniture. Ready for season.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "summer ready".` },
    { category: "Pressure Washing", title: "Graffiti", prompt: `Context: Removed tag from brick wall. Can't tell it was there.\nWord Limit: 30-40 words\nInstructions: Restoration. Mention "complete removal".` },
    { category: "Pressure Washing", title: "Rust Removal", prompt: `Context: Removed rust stains from irrigation. Concrete looks clean.\nWord Limit: 30-40 words\nInstructions: Chem treatment. Mention "stains gone".` },

    // ============================================
    // 13. HANDYMAN
    // ============================================
    { category: "Handyman", title: "Honey-Do List", prompt: `Context: Knocked out 5 small repairs in one visit. Efficient.\nWord Limit: 30-40 words\nInstructions: Variety. Mention "jack of all trades".` },
    { category: "Handyman", title: "TV Mounting", prompt: `Context: Mounted 65in TV. Hid wires in wall. Clean look.\nWord Limit: 25-35 words\nInstructions: Aesthetic. Mention "clean install".` },
    { category: "Handyman", title: "Door Repair", prompt: `Context: Fixed sticking door and replaced knob.\nWord Limit: 20-30 words\nInstructions: Repair. Mention "works perfectly".` },
    { category: "Handyman", title: "Furniture Assembly", prompt: `Context: Built IKEA dresser and desk. Saved me hours.\nWord Limit: 30-40 words\nInstructions: Time saving. Mention "fast assembly".` },
    { category: "Handyman", title: "Drywall Patch", prompt: `Context: Patched hole from doorknob. Texture match perfect.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "invisible patch".` },
    { category: "Handyman", title: "Caulking", prompt: `Context: Recaulked bathtub. Looks fresh and clean.\nWord Limit: 20-30 words\nInstructions: Maintenance. Mention "clean lines".` },
    { category: "Handyman", title: "Shelf Install", prompt: `Context: Put up floating shelves. Level and sturdy.\nWord Limit: 25-35 words\nInstructions: Install. Mention "solid".` },
    { category: "Handyman", title: "Picture Hanging", prompt: `Context: Hung gallery wall art. Perfectly spaced.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "precision".` },
    { category: "Handyman", title: "Fence Lattice", prompt: `Context: Replaced broken lattice. Matched existing.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "good match".` },
    { category: "Handyman", title: "Pet Door", prompt: `Context: Installed doggy door in wall. Sealed well.\nWord Limit: 30-40 words\nInstructions: Project. Mention "pets love it".` },

    // ============================================
    // 14. APPLIANCE REPAIR
    // ============================================
    { category: "Appliance", title: "Fridge", prompt: `Context: Fridge warm. Replaced compressor relay. Cold again.\nWord Limit: 30-40 words\nInstructions: Critical fix. Mention "saved my food".` },
    { category: "Appliance", title: "Washer", prompt: `Context: Washer wouldn't drain. Removed sock from pump.\nWord Limit: 25-35 words\nInstructions: Fix. Mention "quick diagnosis".` },
    { category: "Appliance", title: "Dryer", prompt: `Context: Dryer squeaking. Replaced rollers and belt.\nWord Limit: 30-40 words\nInstructions: Noise. Mention "quiet now".` },
    { category: "Appliance", title: "Dishwasher", prompt: `Context: Not cleaning well. Cleaned filter and spray arms.\nWord Limit: 30-40 words\nInstructions: Maintenance. Mention "sparkling dishes".` },
    { category: "Appliance", title: "Oven", prompt: `Context: Oven not heating. Replaced igniter.\nWord Limit: 25-35 words\nInstructions: Baking. Mention "back to baking".` },
    { category: "Appliance", title: "Ice Maker", prompt: `Context: Ice maker leaked. Fixed water valve.\nWord Limit: 25-35 words\nInstructions: Fix. Mention "no more leaks".` },
    { category: "Appliance", title: "Microwave", prompt: `Context: Built-in microwave dead. Replaced fuse.\nWord Limit: 20-30 words\nInstructions: Simple fix. Mention "honest repair".` },
    { category: "Appliance", title: "Stove Top", prompt: `Context: Burner won't light. Cleaned jets.\nWord Limit: 20-30 words\nInstructions: Function. Mention "works great".` },
    { category: "Appliance", title: "Installation", prompt: `Context: Installed new dishwasher. Updated plumbing connection.\nWord Limit: 30-40 words\nInstructions: Install. Mention "leak free".` },
    { category: "Appliance", title: "Garbage Disposal", prompt: `Context: Jammed disposal. Unjammed it for cheap.\nWord Limit: 25-35 words\nInstructions: Value. Mention "honest".` },

    // ============================================
    // 15. GARAGE DOOR
    // ============================================
    { category: "Garage Door", title: "Broken Spring", prompt: `Context: Spring snapped. Car trapped. Fixed same day.\nWord Limit: 30-40 words\nInstructions: Emergency. Mention "rescued my car".` },
    { category: "Garage Door", title: "New Opener", prompt: `Context: Installed belt drive opener. So quiet.\nWord Limit: 30-40 words\nInstructions: Upgrade. Mention "wifi features" and "quiet".` },
    { category: "Garage Door", title: "Off Track", prompt: `Context: Door went crooked. Reset rollers and track.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "smooth operation".` },
    { category: "Garage Door", title: "New Door", prompt: `Context: Installed insulated modern door. Curb appeal up.\nWord Limit: 40-50 words\nInstructions: Aesthetic. Mention "looks amazing".` },
    { category: "Garage Door", title: "Keypad", prompt: `Context: Installed wireless keypad. Very convenient.\nWord Limit: 20-30 words\nInstructions: Feature. Mention "easy access".` },
    { category: "Garage Door", title: "Maintenance", prompt: `Context: Lubed springs and rollers. Quieter now.\nWord Limit: 25-35 words\nInstructions: Service. Mention "runs smooth".` },
    { category: "Garage Door", title: "Sensors", prompt: `Context: Fixed safety sensors. Door closes properly now.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "peace of mind".` },
    { category: "Garage Door", title: "Weather Seal", prompt: `Context: Replaced bottom seal. No more rain getting in.\nWord Limit: 30-40 words\nInstructions: Protection. Mention "stay dry".` },
    { category: "Garage Door", title: "Cable Snap", prompt: `Context: Cable broke. Replaced both cables.\nWord Limit: 25-35 words\nInstructions: Danger. Mention "safe repair".` },
    { category: "Garage Door", title: "Panel Replacement", prompt: `Context: Backed into door. Replaced just one panel.\nWord Limit: 35-45 words\nInstructions: Value. Mention "saved money".` },

    // ============================================
    // 16. LOCKSMITH
    // ============================================
    { category: "Locksmith", title: "Home Lockout", prompt: `Context: Locked out in rain. Arrived in 15 mins.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "fast arrival".` },
    { category: "Locksmith", title: "Rekey", prompt: `Context: New house. Rekeyed all locks to one key.\nWord Limit: 30-40 words\nInstructions: Security. Mention "one key convenience".` },
    { category: "Locksmith", title: "Car Key", prompt: `Context: Lost fob. Cut and programmed new one onsite.\nWord Limit: 35-45 words\nInstructions: Value. Mention "cheaper than dealer".` },
    { category: "Locksmith", title: "Deadbolt", prompt: `Context: Installed high security deadbolt.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "solid hardware".` },
    { category: "Locksmith", title: "Smart Lock", prompt: `Context: Installed electronic lock. Synced with phone.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "modern".` },
    { category: "Locksmith", title: "Commercial", prompt: `Context: Master key system for office.\nWord Limit: 30-40 words\nInstructions: B2B. Mention "organized".` },
    { category: "Locksmith", title: "Mailbox", prompt: `Context: Replaced mailbox lock.\nWord Limit: 20-30 words\nInstructions: Small job. Mention "quick".` },
    { category: "Locksmith", title: "Safe", prompt: `Context: Opened locked safe. No damage.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "magic touch".` },
    { category: "Locksmith", title: "Extraction", prompt: `Context: Broken key in lock. Removed it.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "skilled".` },
    { category: "Locksmith", title: "Door Closer", prompt: `Context: Fixed slamming business door.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "smooth close".` },

    // ============================================
    // 17. POOL SERVICE
    // ============================================
    { category: "Pool Service", title: "Green to Clean", prompt: `Context: Pool was a swamp. Cleared it in 3 days.\nWord Limit: 35-45 words\nInstructions: Transformation. Mention "crystal clear".` },
    { category: "Pool Service", title: "Weekly Service", prompt: `Context: Comes every Thursday. Pool always sparkling.\nWord Limit: 25-35 words\nInstructions: Reliability. Mention "consistent".` },
    { category: "Pool Service", title: "Pump Repair", prompt: `Context: Pump motor died. Replaced it.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "quiet pump".` },
    { category: "Pool Service", title: "Opening", prompt: `Context: Opened pool for summer. Cover off and chemical balance.\nWord Limit: 30-40 words\nInstructions: Seasonal. Mention "summer ready".` },
    { category: "Pool Service", title: "Closing", prompt: `Context: Winterized pool. Blew out lines.\nWord Limit: 30-40 words\nInstructions: Protection. Mention "safe for winter".` },
    { category: "Pool Service", title: "Heater", prompt: `Context: Fixed heater. Swim season extended.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "warm water".` },
    { category: "Pool Service", title: "Filter Clean", prompt: `Context: Cleaned DE filter grids. Flow improved.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "better flow".` },
    { category: "Pool Service", title: "Salt System", prompt: `Context: Converted to salt water. Skin feels better.\nWord Limit: 35-45 words\nInstructions: Upgrade. Mention "softer water".` },
    { category: "Pool Service", title: "Tile Cleaning", prompt: `Context: Blasted calcium off tile line. Looks new.\nWord Limit: 30-40 words\nInstructions: Aesthetic. Mention "tiles pop".` },
    { category: "Pool Service", title: "Leak Detect", prompt: `Context: Losing water. Found leak in skimmer.\nWord Limit: 30-40 words\nInstructions: Diagnostic. Mention "found the leak".` },

    // ============================================
    // 18. PAINTING (INTERIOR)
    // ============================================
    { category: "Painter", title: "Full House", prompt: `Context: Painted entire interior. Covered furniture perfectly.\nWord Limit: 45-55 words\nInstructions: Project. Mention "careful prep".` },
    { category: "Painter", title: "Cabinets", prompt: `Context: Painted oak cabinets white. Factory finish look.\nWord Limit: 40-50 words\nInstructions: Transformation. Mention "kitchen makeover".` },
    { category: "Painter", title: "Accent Wall", prompt: `Context: Dark blue accent wall. Crisp lines.\nWord Limit: 25-35 words\nInstructions: Design. Mention "pop of color".` },
    { category: "Painter", title: "Ceilings", prompt: `Context: Painted vaulted ceilings. No drips.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "flawless".` },
    { category: "Painter", title: "Trim/Doors", prompt: `Context: Painted baseboards and doors. Bright white.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "updated look".` },
    { category: "Painter", title: "Wallpaper Removal", prompt: `Context: Removed 90s wallpaper. Skim coated walls.\nWord Limit: 40-50 words\nInstructions: Prep work. Mention "smooth walls".` },
    { category: "Painter", title: "Texture", prompt: `Context: Matched orange peel texture on patch.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "invisible blend".` },
    { category: "Painter", title: "Staircase", prompt: `Context: Painted banister and spindles.\nWord Limit: 35-45 words\nInstructions: Detail. Mention "tedious work done well".` },
    { category: "Painter", title: "Color Consult", prompt: `Context: Helped pick colors. Flow is perfect.\nWord Limit: 30-40 words\nInstructions: Design. Mention "helpful advice".` },
    { category: "Painter", title: "Touch Ups", prompt: `Context: Touched up scuffs before sale.\nWord Limit: 25-35 words\nInstructions: Sale prep. Mention "fresh".` },

    // ============================================
    // 19. PAINTING (EXTERIOR)
    // ============================================
    { category: "Painter", title: "Whole Exterior", prompt: `Context: Stucco painting. Sealed cracks properly.\nWord Limit: 40-50 words\nInstructions: Protection. Mention "waterproof".` },
    { category: "Painter", title: "Deck Stain", prompt: `Context: Stained deck and fence. Cedar tone.\nWord Limit: 35-45 words\nInstructions: Protection. Mention "rich color".` },
    { category: "Painter", title: "Front Door", prompt: `Context: Refinished front door. High gloss.\nWord Limit: 25-35 words\nInstructions: Curb appeal. Mention "welcoming".` },
    { category: "Painter", title: "Trim Paint", prompt: `Context: Painted fascia and soffits.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "sharp contrast".` },
    { category: "Painter", title: "Brick Paint", prompt: `Context: Limewashed brick house. Modern farmhouse look.\nWord Limit: 40-50 words\nInstructions: Transformation. Mention "total change".` },
    { category: "Painter", title: "Shutters", prompt: `Context: Painted shutters black.\nWord Limit: 25-35 words\nInstructions: Update. Mention "modernized".` },
    { category: "Painter", title: "Garage Floor", prompt: `Context: Epoxy floor coating. Looks like showroom.\nWord Limit: 35-45 words\nInstructions: Finish. Mention "durable".` },
    { category: "Painter", title: "Iron Fence", prompt: `Context: Painted wrought iron fence. Treated rust.\nWord Limit: 30-40 words\nInstructions: Maintenance. Mention "rust protection".` },
    { category: "Painter", title: "Siding Stain", prompt: `Context: Solid stain on cedar siding.\nWord Limit: 35-45 words\nInstructions: Quality. Mention "even coverage".` },
    { category: "Painter", title: "Window Trim", prompt: `Context: Glazed and painted old windows.\nWord Limit: 30-40 words\nInstructions: Restoration. Mention "saved the windows".` },

    // ============================================
    // 20. DRYWALL
    // ============================================
    { category: "Drywall", title: "Hole Patch", prompt: `Context: Patched doorknob hole. Texture match perfect.\nWord Limit: 25-35 words\nInstructions: seamless. Mention "can't see it".` },
    { category: "Drywall", title: "Water Damage", prompt: `Context: Cut out wet rock from leak. Replaced and painted.\nWord Limit: 35-45 words\nInstructions: Restoration. Mention "like new".` },
    { category: "Drywall", title: "Basement Finish", prompt: `Context: Hung and taped whole basement. Fast crew.\nWord Limit: 40-50 words\nInstructions: Project. Mention "smooth walls".` },
    { category: "Drywall", title: "Ceiling Repair", prompt: `Context: Fixed crack in ceiling. Blended well.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "invisible".` },
    { category: "Drywall", title: "Popcorn Removal", prompt: `Context: Scraped acoustic ceiling. Smooth finish.\nWord Limit: 40-50 words\nInstructions: Modernize. Mention "messy but worth it".` },
    { category: "Drywall", title: "Skim Coat", prompt: `Context: Skim coated bad walls. Glass smooth.\nWord Limit: 35-45 words\nInstructions: Finish. Mention "perfect surface".` },
    { category: "Drywall", title: "Corner Bead", prompt: `Context: Fixed damaged corner.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "straight edge".` },
    { category: "Drywall", title: "Soundproofing", prompt: `Context: Installed quiet rock. Noise reduction amazing.\nWord Limit: 35-45 words\nInstructions: Function. Mention "quiet".` },
    { category: "Drywall", title: "Garage", prompt: `Context: Fire taped garage walls.\nWord Limit: 30-40 words\nInstructions: Code. Mention "clean taping".` },
    { category: "Drywall", title: "Plaster Repair", prompt: `Context: Fixed historic plaster wall.\nWord Limit: 35-45 words\nInstructions: Service. Mention "craftsmanship".` },

    // ============================================
    // 21. FLOORING
    // ============================================
    { category: "Flooring", title: "Hardwood Refinish", prompt: `Context: Sanded oak floors. Dark walnut stain. Dustless system.\nWord Limit: 40-50 words\nInstructions: Result. Mention "beautiful grain".` },
    { category: "Flooring", title: "LVP Install", prompt: `Context: Installed luxury vinyl plank. Waterproof. Looks unique.\nWord Limit: 35-45 words\nInstructions: Product. Mention "durable".` },
    { category: "Flooring", title: "Carpet Install", prompt: `Context: New plush carpet in bedrooms. Soft padding.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "cozy".` },
    { category: "Flooring", title: "Tile Floor", prompt: `Context: Tiled kitchen floor. Herringbone pattern.\nWord Limit: 35-45 words\nInstructions: Design. Mention "pattern precision".` },
    { category: "Flooring", title: "Laminate", prompt: `Context: Replaced carpet with laminate.\nWord Limit: 30-40 words\nInstructions: Update. Mention "easy to clean".` },
    { category: "Flooring", title: "Repair", prompt: `Context: Fixed scratched boards. Matched finish.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "blended in".` },
    { category: "Flooring", title: "Stair Treads", prompt: `Context: Replaced carpet stairs with wood treads.\nWord Limit: 35-45 words\nInstructions: Upgrade. Mention "modern look".` },
    { category: "Flooring", title: "Baseboards", prompt: `Context: Installed new tall baseboards with floors.\nWord Limit: 30-40 words\nInstructions: Trim. Mention "finished look".` },
    { category: "Flooring", title: "Epoxy", prompt: `Context: Basement floor epoxy.\nWord Limit: 30-40 words\nInstructions: Utility. Mention "clean look".` },
    { category: "Flooring", title: "Engineered Wood", prompt: `Context: Glued down engineered hardwood on slab.\nWord Limit: 35-45 words\nInstructions: Install. Mention "solid feel".` },

    // ============================================
    // 22. TILING
    // ============================================
    { category: "Tiling", title: "Backsplash", prompt: `Context: Subway tile backsplash. Perfect grout lines.\nWord Limit: 30-40 words\nInstructions: Aesthetic. Mention "kitchen pop".` },
    { category: "Tiling", title: "Shower", prompt: `Context: Walk-in shower tile. Waterproofing done right.\nWord Limit: 40-50 words\nInstructions: Build. Mention "waterproof".` },
    { category: "Tiling", title: "Floor Tile", prompt: `Context: Large format tiles. Leveled perfectly.\nWord Limit: 35-45 words\nInstructions: Skill. Mention "lippage free".` },
    { category: "Tiling", title: "Fireplace", prompt: `Context: Tiled fireplace surround. Marble.\nWord Limit: 30-40 words\nInstructions: Design. Mention "focal point".` },
    { category: "Tiling", title: "Regrouting", prompt: `Context: Removed old grout and replaced. Looks new.\nWord Limit: 30-40 words\nInstructions: Refresh. Mention "clean lines".` },
    { category: "Tiling", title: "Mosaic", prompt: `Context: Intricate mosaic floor in bath.\nWord Limit: 35-45 words\nInstructions: Artistry. Mention "detail".` },
    { category: "Tiling", title: "Repair", prompt: `Context: Replaced cracked tiles.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "match".` },
    { category: "Tiling", title: "Sealing", prompt: `Context: Cleaned and sealed stone tile.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "protected".` },
    { category: "Tiling", title: "Outdoor", prompt: `Context: Tiled patio. Non-slip.\nWord Limit: 35-45 words\nInstructions: Outdoor. Mention "durable".` },
    { category: "Tiling", title: "Heated Floor", prompt: `Context: Installed electric floor heat under tile.\nWord Limit: 30-40 words\nInstructions: Luxury. Mention "toasty feet".` },

    // ============================================
    // 23. FENCING
    // ============================================
    { category: "Fencing", title: "Wood Privacy", prompt: `Context: Cedar privacy fence. Straight lines.\nWord Limit: 35-45 words\nInstructions: Privacy. Mention "solid build".` },
    { category: "Fencing", title: "Vinyl", prompt: `Context: White vinyl fence. Maintenance free.\nWord Limit: 30-40 words\nInstructions: Look. Mention "clean look".` },
    { category: "Fencing", title: "Chain Link", prompt: `Context: Black chain link for dog run. Secure.\nWord Limit: 30-40 words\nInstructions: Utility. Mention "keeps dog in".` },
    { category: "Fencing", title: "Aluminum", prompt: `Context: Ornamental aluminum fence. Pool code compliant.\nWord Limit: 35-45 words\nInstructions: Style. Mention "elegant".` },
    { category: "Fencing", title: "Repair", prompt: `Context: Replaced broken posts after storm.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "sturdy again".` },
    { category: "Fencing", title: "Gate Fix", prompt: `Context: Fixed sagging gate. Latches perfectly now.\nWord Limit: 25-35 words\nInstructions: Function. Mention "smooth operation".` },
    { category: "Fencing", title: "Staining", prompt: `Context: Stained fence for protection.\nWord Limit: 30-40 words\nInstructions: Maintenance. Mention "looks new".` },
    { category: "Fencing", title: "Farm Fence", prompt: `Context: Post and rail fence with wire.\nWord Limit: 35-45 words\nInstructions: Rural. Mention "classic look".` },
    { category: "Fencing", title: "Deer Fence", prompt: `Context: Installed deer fencing for garden.\nWord Limit: 30-40 words\nInstructions: Protection. Mention "garden saved".` },
    { category: "Fencing", title: "Custom", prompt: `Context: Horizontal slat modern fence.\nWord Limit: 35-45 words\nInstructions: Design. Mention "modern style".` },

    // ============================================
    // 24. DECK BUILDER
    // ============================================
    { category: "Deck", title: "Composite Deck", prompt: `Context: Trex deck. Hidden fasteners. No maintenance.\nWord Limit: 40-50 words\nInstructions: Material. Mention "maintenance free".` },
    { category: "Deck", title: "Wood Deck", prompt: `Context: Pressure treated deck. Solid construction.\nWord Limit: 35-45 words\nInstructions: Value. Mention "sturdy".` },
    { category: "Deck", title: "Railings", prompt: `Context: Aluminum cable railings. View preservation.\nWord Limit: 30-40 words\nInstructions: View. Mention "modern look".` },
    { category: "Deck", title: "Stairs", prompt: `Context: Replaced unsafe stairs. Wide and safe.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "code compliant".` },
    { category: "Deck", title: "Pergola", prompt: `Context: Built pergola over deck. Shade is great.\nWord Limit: 35-45 words\nInstructions: Comfort. Mention "shade".` },
    { category: "Deck", title: "Resurfacing", prompt: `Context: Kept frame, replaced boards. Like new.\nWord Limit: 35-45 words\nInstructions: Savings. Mention "smart solution".` },
    { category: "Deck", title: "Repair", prompt: `Context: Replaced rotted boards.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "safe again".` },
    { category: "Deck", title: "Lighting", prompt: `Context: Post cap lights. Ambiance at night.\nWord Limit: 30-40 words\nInstructions: Feature. Mention "night use".` },
    { category: "Deck", title: "Multi-Level", prompt: `Context: Complex multi-level deck design.\nWord Limit: 45-55 words\nInstructions: Design. Mention "impressive build".` },
    { category: "Deck", title: "Permitting", prompt: `Context: Handled difficult permit process.\nWord Limit: 30-40 words\nInstructions: Admin. Mention "hassle free".` },

    // ============================================
    // 25. SIDING
    // ============================================
    { category: "Siding", title: "Vinyl Install", prompt: `Context: Replaced wood with vinyl. Insulated backing.\nWord Limit: 40-50 words\nInstructions: Efficiency. Mention "looks updated".` },
    { category: "Siding", title: "Hardie Board", prompt: `Context: Installed fiber cement. High end look.\nWord Limit: 40-50 words\nInstructions: Quality. Mention "durable".` },
    { category: "Siding", title: "Repair", prompt: `Context: Fixed wind damaged piece. Matched color.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "perfect match".` },
    { category: "Siding", title: "Painting", prompt: `Context: Painted aluminum siding. Spray finish.\nWord Limit: 35-45 words\nInstructions: Refresh. Mention "saved money vs replace".` },
    { category: "Siding", title: "Wood Siding", prompt: `Context: Cedar shake replacment. Authentic.\nWord Limit: 40-50 words\nInstructions: Style. Mention "classic look".` },
    { category: "Siding", title: "Soffit/Fascia", prompt: `Context: Wrapped fascia in aluminum. Maintenance free.\nWord Limit: 35-45 words\nInstructions: Maintenance. Mention "smooth finish".` },
    { category: "Siding", title: "Stone Veneer", prompt: `Context: Added stone accent to front.\nWord Limit: 35-45 words\nInstructions: Curb appeal. Mention "rich look".` },
    { category: "Siding", title: "Trim", prompt: `Context: Replaced rotted window trim with PVC.\nWord Limit: 30-40 words\nInstructions: Material. Mention "never rot".` },
    { category: "Siding", title: "Full Exterior", prompt: `Context: Complete exterior makeover.\nWord Limit: 45-55 words\nInstructions: Project. Mention "new house".` },
    { category: "Siding", title: "Stucco", prompt: `Context: Repair stucco cracks.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "seamless".` },

    // ============================================
    // 26. RUG STORE
    // ============================================
    { category: "Rug Store", title: "Persian Rug", prompt: `Context: Bought hand-knotted Persian rug. Stunning colors.\nWord Limit: 35-45 words\nInstructions: Quality. Mention "masterpiece".` },
    { category: "Rug Store", title: "Cleaning", prompt: `Context: Cleaned wool rug. Pet stains gone.\nWord Limit: 30-40 words\nInstructions: Result. Mention "bright colors".` },
    { category: "Rug Store", title: "Repair", prompt: `Context: Fixed frayed fringe. Invisible repair.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "craftsmanship".` },
    { category: "Rug Store", title: "Pad", prompt: `Context: Custom cut rug pad. Non-slip.\nWord Limit: 20-30 words\nInstructions: Function. Mention "perfect fit".` },
    { category: "Rug Store", title: "Modern", prompt: `Context: Bought abstract modern rug.\nWord Limit: 25-35 words\nInstructions: Style. Mention "ties room together".` },
    { category: "Rug Store", title: "Trial", prompt: `Context: Let me try rug at home first.\nWord Limit: 30-40 words\nInstructions: Service. Mention "helpful".` },
    { category: "Rug Store", title: "Fair Price", prompt: `Context: Better price than department store.\nWord Limit: 25-35 words\nInstructions: Value. Mention "great deal".` },
    { category: "Rug Store", title: "Runner", prompt: `Context: Installed stair runner.\nWord Limit: 30-40 words\nInstructions: Install. Mention "secure".` },
    { category: "Rug Store", title: "Silk", prompt: `Context: Silk blend rug. So soft.\nWord Limit: 20-30 words\nInstructions: Luxury. Mention "elegant".` },
    { category: "Rug Store", title: "Appraisal", prompt: `Context: Appraised antique rug.\nWord Limit: 25-35 words\nInstructions: Expertise. Mention "knowledgeable".` },

    // ============================================
    // 27. MOVERS
    // ============================================
    { category: "Movers", title: "Local Move", prompt: `Context: Moved across town in 6 hours.\nWord Limit: 30-40 words\nInstructions: Efficiency. Mention "fast crew".` },
    { category: "Movers", title: "Long Distance", prompt: `Context: Moved state to state. On time.\nWord Limit: 35-45 words\nInstructions: Reliability. Mention "smooth process".` },
    { category: "Movers", title: "Packing", prompt: `Context: Packed kitchen. Nothing broken.\nWord Limit: 30-40 words\nInstructions: Care. Mention "careful".` },
    { category: "Movers", title: "Piano", prompt: `Context: Moved baby grand piano safely.\nWord Limit: 25-35 words\nInstructions: Skill. Mention "heavy lifting".` },
    { category: "Movers", title: "Apartment", prompt: `Context: 4th floor walk up. No complaints.\nWord Limit: 30-40 words\nInstructions: Attitude. Mention "hard workers".` },
    { category: "Movers", title: "Office", prompt: `Context: Relocated business. Minimized downtime.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "professional".` },
    { category: "Movers", title: "Last Minute", prompt: `Context: Squeezed me in next day.\nWord Limit: 30-40 words\nInstructions: Lifesaver. Mention "accommodating".` },
    { category: "Movers", title: "Storage", prompt: `Context: Loaded POD professionally.\nWord Limit: 25-35 words\nInstructions: Tetris. Mention "maximized space".` },
    { category: "Movers", title: "Labor Only", prompt: `Context: Unloaded rental truck.\nWord Limit: 20-30 words\nInstructions: Muscle. Mention "strong helpers".` },
    { category: "Movers", title: "Antique", prompt: `Context: Moved fragile armoire.\nWord Limit: 25-35 words\nInstructions: Care. Mention "white glove".` },

    // ============================================
    // 28. EARTH WORKS
    // ============================================
    { category: "Earth Works", title: "Grading", prompt: `Context: Graded yard for drainage.\nWord Limit: 30-40 words\nInstructions: Function. Mention "dry yard".` },
    { category: "Earth Works", title: "Excavation", prompt: `Context: Dug foundation for addition.\nWord Limit: 30-40 words\nInstructions: Precision. Mention "clean dig".` },
    { category: "Earth Works", title: "Gravel Drive", prompt: `Context: New gravel driveway. Rolled smooth.\nWord Limit: 30-40 words\nInstructions: Finish. Mention "smooth ride".` },
    { category: "Earth Works", title: "Clearing", prompt: `Context: Cleared brush and stumps.\nWord Limit: 35-45 words\nInstructions: Transform. Mention "open space".` },
    { category: "Earth Works", title: "Trenching", prompt: `Context: Trenched for utilities.\nWord Limit: 25-35 words\nInstructions: Utility. Mention "neat".` },
    { category: "Earth Works", title: "Septic Install", prompt: `Context: Installed new septic system.\nWord Limit: 40-50 words\nInstructions: System. Mention "passed inspection".` },
    { category: "Earth Works", title: "Demolition", prompt: `Context: Demoed old shed.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "clean site".` },
    { category: "Earth Works", title: "Erosion", prompt: `Context: Fixed hillside erosion.\nWord Limit: 35-45 words\nInstructions: Solution. Mention "stabilized".` },
    { category: "Earth Works", title: "Pool Dig", prompt: `Context: Excavated for pool.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "precise".` },
    { category: "Earth Works", title: "Retaining Wall Prep", prompt: `Context: Dug footings for wall.\nWord Limit: 25-35 words\nInstructions: Prep. Mention "ready to build".` },

    // ============================================
    // 29. SOLAR
    // ============================================
    { category: "Solar", title: "Install", prompt: `Context: 24 panel install. Clean work.\nWord Limit: 35-45 words\nInstructions: Install. Mention "clean conduit".` },
    { category: "Solar", title: "Savings", prompt: `Context: Bill went to zero.\nWord Limit: 30-40 words\nInstructions: ROI. Mention "no electric bill".` },
    { category: "Solar", title: "Battery", prompt: `Context: Powerwall backup installed.\nWord Limit: 35-45 words\nInstructions: Security. Mention "energy independence".` },
    { category: "Solar", title: "Sales", prompt: `Context: No pressure sales.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "honest numbers".` },
    { category: "Solar", title: "Aesthetic", prompt: `Context: All black panels look sleek.\nWord Limit: 25-35 words\nInstructions: Look. Mention "modern".` },
    { category: "Solar", title: "Inverter", prompt: `Context: Replaced bad inverter.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "warranty".` },
    { category: "Solar", title: "Cleaning", prompt: `Context: Cleaned panels. Power up.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "efficiency".` },
    { category: "Solar", title: "Commercial", prompt: `Context: Solar for warehouse.\nWord Limit: 40-50 words\nInstructions: B2B. Mention "business investment".` },
    { category: "Solar", title: "Re-Roof", prompt: `Context: Removed/Reinstalled for roof.\nWord Limit: 35-45 words\nInstructions: Service. Mention "seamless".` },
    { category: "Solar", title: "App", prompt: `Context: Monitoring app is great.\nWord Limit: 20-30 words\nInstructions: Tech. Mention "user friendly".` },

    // ============================================
    // 30. HEAT PUMP
    // ============================================
    { category: "Heat Pump", title: "Conversion", prompt: `Context: Switched oil to heat pump.\nWord Limit: 35-45 words\nInstructions: Upgrade. Mention "consistent heat".` },
    { category: "Heat Pump", title: "Mini-Split", prompt: `Context: Ductless in garage.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "warm garage".` },
    { category: "Heat Pump", title: "Efficiency", prompt: `Context: Lower heating bills.\nWord Limit: 30-40 words\nInstructions: Savings. Mention "efficient".` },
    { category: "Heat Pump", title: "Quiet", prompt: `Context: Unit is silent.\nWord Limit: 20-30 words\nInstructions: Noise. Mention "whisper quiet".` },
    { category: "Heat Pump", title: "Cold Weather", prompt: `Context: Works in freezing temps.\nWord Limit: 30-40 words\nInstructions: Performance. Mention "impressive".` },
    { category: "Heat Pump", title: "Rebates", prompt: `Context: Helped with tax credits.\nWord Limit: 35-45 words\nInstructions: Value. Mention "maximized savings".` },
    { category: "Heat Pump", title: "Hybrid", prompt: `Context: Dual fuel system.\nWord Limit: 35-45 words\nInstructions: Smarts. Mention "best system".` },
    { category: "Heat Pump", title: "Pool Heat", prompt: `Context: Pool heat pump.\nWord Limit: 30-40 words\nInstructions: Lifestyle. Mention "swim longer".` },
    { category: "Heat Pump", title: "Repair", prompt: `Context: Fixed outdoor unit.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "fast fix".` },
    { category: "Heat Pump", title: "Install", prompt: `Context: Clean installation.\nWord Limit: 25-35 words\nInstructions: Professional. Mention "neat".` },

    // ============================================
    // 31. LED INDOOR (Commercial)
    // ============================================
    { category: "LED Indoor", title: "Office Retrofit", prompt: `Context: Replaced office lights with LED.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "brighter office".` },
    { category: "LED Indoor", title: "Warehouse", prompt: `Context: High bay LEDs. Great visibility.\nWord Limit: 35-45 words\nInstructions: Safety. Mention "bright work area".` },
    { category: "LED Indoor", title: "Retail", prompt: `Context: Track lighting for shop.\nWord Limit: 30-40 words\nInstructions: Display. Mention "products pop".` },
    { category: "LED Indoor", title: "Lobby", prompt: `Context: Accent lighting in reception.\nWord Limit: 25-35 words\nInstructions: Mood. Mention "welcoming".` },
    { category: "LED Indoor", title: "ROI Audit", prompt: `Context: Energy savings audit.\nWord Limit: 30-40 words\nInstructions: Business. Mention "payback period".` },
    { category: "LED Indoor", title: "Sensors", prompt: `Context: Motion sensor lights.\nWord Limit: 30-40 words\nInstructions: Efficiency. Mention "automation".` },
    { category: "LED Indoor", title: "Restaurant", prompt: `Context: Dimmable warm LEDs.\nWord Limit: 30-40 words\nInstructions: Ambiance. Mention "cozy".` },
    { category: "LED Indoor", title: "Building Upgrade", prompt: `Context: Whole building retrofit.\nWord Limit: 40-50 words\nInstructions: Project. Mention "zero downtime".` },
    { category: "LED Indoor", title: "Gallery", prompt: `Context: High CRI lights for art.\nWord Limit: 30-40 words\nInstructions: Quality. Mention "true color".` },
    { category: "LED Indoor", title: "Emergency", prompt: `Context: Updated exit signs.\nWord Limit: 25-35 words\nInstructions: Code. Mention "compliant".` },

    // ============================================
    // 32. LED OUTDOOR
    // ============================================
    { category: "LED Outdoor", title: "Landscape", prompt: `Context: Uplighting on house and trees.\nWord Limit: 35-45 words\nInstructions: Curb appeal. Mention "stunning at night".` },
    { category: "LED Outdoor", title: "Security", prompt: `Context: Bright floodlights.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "well lit".` },
    { category: "LED Outdoor", title: "Parking Lot", prompt: `Context: LED pole lights.\nWord Limit: 35-45 words\nInstructions: Commercial. Mention "safer lot".` },
    { category: "LED Outdoor", title: "Deck Lights", prompt: `Context: String lights and step lights.\nWord Limit: 30-40 words\nInstructions: Fun. Mention "party ready".` },
    { category: "LED Outdoor", title: "Color RGB", prompt: `Context: Color changing lights.\nWord Limit: 30-40 words\nInstructions: Feature. Mention "holiday colors".` },
    { category: "LED Outdoor", title: "Pathway", prompt: `Context: Walkway lights.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "safe path".` },
    { category: "LED Outdoor", title: "Pool", prompt: `Context: Color pool lights.\nWord Limit: 30-40 words\nInstructions: Look. Mention "vibrant".` },
    { category: "LED Outdoor", title: "Signage", prompt: `Context: Lit up business sign.\nWord Limit: 30-40 words\nInstructions: Marketing. Mention "visible".` },
    { category: "LED Outdoor", title: "Bollards", prompt: `Context: Driveway bollard lights.\nWord Limit: 25-35 words\nInstructions: Style. Mention "classy".` },
    { category: "LED Outdoor", title: "Maintenance", prompt: `Context: Replaced bulbs with LED.\nWord Limit: 25-35 words\nInstructions: Upgrade. Mention "maintenance free".` },

    // ============================================
    // 33. WINDOWS & DOORS
    // ============================================
    { category: "Windows", title: "Replacement", prompt: `Context: Replaced drafty windows.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "no drafts".` },
    { category: "Windows", title: "Patio Door", prompt: `Context: New sliding door.\nWord Limit: 30-40 words\nInstructions: Function. Mention "glides smooth".` },
    { category: "Windows", title: "Front Door", prompt: `Context: Installed mahogany door.\nWord Limit: 30-40 words\nInstructions: Curb appeal. Mention "statement piece".` },
    { category: "Windows", title: "Energy Efficient", prompt: `Context: Triple pane windows.\nWord Limit: 35-45 words\nInstructions: Value. Mention "quiet and efficient".` },
    { category: "Windows", title: "Install Crew", prompt: `Context: Crew was clean and fast.\nWord Limit: 30-40 words\nInstructions: Service. Mention "respectful".` },
    { category: "Windows", title: "Bay Window", prompt: `Context: Replaced bay window.\nWord Limit: 35-45 words\nInstructions: Feature. Mention "great view".` },
    { category: "Windows", title: "Storm Door", prompt: `Context: Installed storm door.\nWord Limit: 25-35 words\nInstructions: Utility. Mention "extra light".` },
    { category: "Windows", title: "Glass Repair", prompt: `Context: Fixed broken pane.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "fast glass".` },
    { category: "Windows", title: "Skylight", prompt: `Context: Added skylights.\nWord Limit: 30-40 words\nInstructions: Light. Mention "natural light".` },
    { category: "Windows", title: "Emergency Boardup", prompt: `Context: Boarded up broken window.\nWord Limit: 25-35 words\nInstructions: Emergency. Mention "secure".` },

    // ============================================
    // 34. HOME INSPECTION
    // ============================================
    { category: "Home Inspection", title: "Pre-Purchase", prompt: `Context: Thorough inspection before buying.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "caught issues".` },
    { category: "Home Inspection", title: "Report", prompt: `Context: Report was easy to read with photos.\nWord Limit: 30-40 words\nInstructions: Clarity. Mention "detailed report".` },
    { category: "Home Inspection", title: "Radon", prompt: `Context: Did radon test too.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "thorough".` },
    { category: "Home Inspection", title: "Pest", prompt: `Context: Termite inspection included.\nWord Limit: 25-35 words\nInstructions: Value. Mention "all in one".` },
    { category: "Home Inspection", title: "Walkthrough", prompt: `Context: Walked me through every finding.\nWord Limit: 35-45 words\nInstructions: Education. Mention "patient explainer".` },
    { category: "Home Inspection", title: "New Construction", prompt: `Context: Inspected new build. Found errors.\nWord Limit: 30-40 words\nInstructions: Value. Mention "saved me trouble".` },
    { category: "Home Inspection", title: "Sewer Scope", prompt: `Context: Scoped sewer line.\nWord Limit: 25-35 words\nInstructions: Tech. Mention "worth the extra cost".` },
    { category: "Home Inspection", title: "Honesty", prompt: `Context: Unbiased opinion.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "honest".` },
    { category: "Home Inspection", title: "Fast Turnaround", prompt: `Context: Report delivered same night.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "fast report".` },
    { category: "Home Inspection", title: "11 Month", prompt: `Context: Warranty inspection.\nWord Limit: 30-40 words\nInstructions: Value. Mention "warranty punchlist".` },

    // ============================================
    // 35. WATER DAMAGE
    // ============================================
    { category: "Restoration", title: "Flood", prompt: `Context: Basement flooded. Pumped out water.\nWord Limit: 30-40 words\nInstructions: Emergency. Mention "fast extraction".` },
    { category: "Restoration", title: "Drying", prompt: `Context: Set up huge fans. Dried everything.\nWord Limit: 30-40 words\nInstructions: Process. Mention "saved the drywall".` },
    { category: "Restoration", title: "Insurance", prompt: `Context: Handled insurance claim.\nWord Limit: 30-40 words\nInstructions: Admin. Mention "easy claim".` },
    { category: "Restoration", title: "Cleanup", prompt: `Context: Cleaned up sewage backup.\nWord Limit: 25-35 words\nInstructions: Hygiene. Mention "sanitized".` },
    { category: "Restoration", title: "Rebuild", prompt: `Context: Rebuilt walls after damage.\nWord Limit: 35-45 words\nInstructions: Project. Mention "like it never happened".` },
    { category: "Restoration", title: "Mold Prev", prompt: `Context: Prevented mold growth.\nWord Limit: 30-40 words\nInstructions: Health. Mention "peace of mind".` },
    { category: "Restoration", title: "Pipe Burst", prompt: `Context: Burst pipe cleanup.\nWord Limit: 30-40 words\nInstructions: Emergency. Mention "lifesavers".` },
    { category: "Restoration", title: "Fire/Smoke", prompt: `Context: Cleaned smoke smell.\nWord Limit: 30-40 words\nInstructions: Odor. Mention "zero smell".` },
    { category: "Restoration", title: "Pack Out", prompt: `Context: Packed up furniture to save it.\nWord Limit: 35-45 words\nInstructions: Care. Mention "saved my stuff".` },
    { category: "Restoration", title: "24/7", prompt: `Context: Came at 3am.\nWord Limit: 25-35 words\nInstructions: Availability. Mention "immediate help".` },

    // ============================================
    // 36. MOLD REMEDIATION
    // ============================================
    { category: "Mold", title: "Attic Mold", prompt: `Context: Found mold in attic. Remediated fully.\nWord Limit: 30-40 words\nInstructions: Health. Mention "safe air".` },
    { category: "Mold", title: "Bathroom", prompt: `Context: Mold behind shower tile.\nWord Limit: 30-40 words\nInstructions: Cleanup. Mention "thorough".` },
    { category: "Mold", title: "Testing", prompt: `Context: Air quality testing.\nWord Limit: 25-35 words\nInstructions: Science. Mention "peace of mind".` },
    { category: "Mold", title: "Crawlspace", prompt: `Context: Encapsulated crawlspace.\nWord Limit: 35-45 words\nInstructions: Prevention. Mention "dry crawlspace".` },
    { category: "Mold", title: "Black Mold", prompt: `Context: Removed toxic mold.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "professional containment".` },
    { category: "Mold", title: "Basement", prompt: `Context: Treated basement walls.\nWord Limit: 30-40 words\nInstructions: Service. Mention "clean smell".` },
    { category: "Mold", title: "Prevention", prompt: `Context: Installed dehumidifier.\nWord Limit: 25-35 words\nInstructions: Install. Mention "humidity control".` },
    { category: "Mold", title: "HVAC Mold", prompt: `Context: Cleaned mold from ducts.\nWord Limit: 30-40 words\nInstructions: Air. Mention "breathing easier".` },
    { category: "Mold", title: "Protocol", prompt: `Context: Followed strict safety protocol.\nWord Limit: 35-45 words\nInstructions: Trust. Mention "certified".` },
    { category: "Mold", title: "Clearance", prompt: `Context: Passed clearance test.\nWord Limit: 25-35 words\nInstructions: Result. Mention "guaranteed".` },

    // ============================================
    // 37. JUNK REMOVAL
    // ============================================
    { category: "Junk Removal", title: "Garage Cleanout", prompt: `Context: Cleared hoarded garage.\nWord Limit: 30-40 words\nInstructions: Relief. Mention "so much space".` },
    { category: "Junk Removal", title: "Old Furniture", prompt: `Context: Removed old couch and mattress.\nWord Limit: 25-35 words\nInstructions: Heavy lift. Mention "easy".` },
    { category: "Junk Removal", title: "Construction Debris", prompt: `Context: Picked up remodel trash.\nWord Limit: 30-40 words\nInstructions: Cleanup. Mention "site is clean".` },
    { category: "Junk Removal", title: "Hot Tub", prompt: `Context: Cut up and removed hot tub.\nWord Limit: 30-40 words\nInstructions: Demo. Mention "gone".` },
    { category: "Junk Removal", title: "Appliance", prompt: `Context: Took old fridge.\nWord Limit: 20-30 words\nInstructions: Recycling. Mention "fast pickup".` },
    { category: "Junk Removal", title: "Yard Waste", prompt: `Context: Hauled brush piles.\nWord Limit: 25-35 words\nInstructions: Yard. Mention "clean yard".` },
    { category: "Junk Removal", title: "Estate Cleanout", prompt: `Context: Cleared whole house.\nWord Limit: 35-45 words\nInstructions: Sensitive. Mention "respectful".` },
    { category: "Junk Removal", title: "Curbside", prompt: `Context: Picked up pile from curb.\nWord Limit: 20-30 words\nInstructions: Convenience. Mention "contactless".` },
    { category: "Junk Removal", title: "Shed Demo", prompt: `Context: Tore down old shed.\nWord Limit: 30-40 words\nInstructions: Demo. Mention "safe demo".` },
    { category: "Junk Removal", title: "Donation", prompt: `Context: Donated items for me.\nWord Limit: 25-35 words\nInstructions: Charity. Mention "eco friendly".` },

    // ============================================
    // 38. AUTO REPAIR
    // ============================================
    { category: "Auto Repair", title: "Brakes", prompt: `Context: Replaced pads and rotors.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "no squeak".` },
    { category: "Auto Repair", title: "Oil Change", prompt: `Context: Quick lube service.\nWord Limit: 20-30 words\nInstructions: Speed. Mention "in and out".` },
    { category: "Auto Repair", title: "Check Engine", prompt: `Context: Diagnosed sensor issue.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "accurate".` },
    { category: "Auto Repair", title: "Tires", prompt: `Context: New set of tires.\nWord Limit: 30-40 words\nInstructions: Ride. Mention "smooth ride".` },
    { category: "Auto Repair", title: "AC Fix", prompt: `Context: Fixed car AC.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "ice cold".` },
    { category: "Auto Repair", title: "Transmission", prompt: `Context: Rebuilt transmission.\nWord Limit: 40-50 words\nInstructions: Major repair. Mention "shifts smooth".` },
    { category: "Auto Repair", title: "Battery", prompt: `Context: Swapped battery.\nWord Limit: 20-30 words\nInstructions: Fix. Mention "starts instant".` },
    { category: "Auto Repair", title: "Suspension", prompt: `Context: Replaced struts.\nWord Limit: 30-40 words\nInstructions: Ride. Mention "no bumps".` },
    { category: "Auto Repair", title: "Fair Price", prompt: `Context: Cheaper than dealer.\nWord Limit: 25-35 words\nInstructions: Value. Mention "honest price".` },
    { category: "Auto Repair", title: "Loaner", prompt: `Context: Gave me loaner car.\nWord Limit: 25-35 words\nInstructions: Service. Mention "convenient".` },

    // ============================================
    // 39. AUTO BODY
    // ============================================
    { category: "Auto Body", title: "Dent Repair", prompt: `Context: Fixed door dent.\nWord Limit: 30-40 words\nInstructions: Result. Mention "invisible".` },
    { category: "Auto Body", title: "Paint Match", prompt: `Context: Painted bumper.\nWord Limit: 30-40 words\nInstructions: Color. Mention "perfect match".` },
    { category: "Auto Body", title: "Collision", prompt: `Context: Restored after crash.\nWord Limit: 35-45 words\nInstructions: Restoration. Mention "like new".` },
    { category: "Auto Body", title: "Scratch", prompt: `Context: Buffed out scratch.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "gone".` },
    { category: "Auto Body", title: "Insurance", prompt: `Context: Handled insurance claim.\nWord Limit: 30-40 words\nInstructions: Admin. Mention "easy process".` },
    { category: "Auto Body", title: "Hail Damage", prompt: `Context: PDR for hail.\nWord Limit: 30-40 words\nInstructions: Value. Mention "saved factory paint".` },
    { category: "Auto Body", title: "Bumper", prompt: `Context: Replaced cracked bumper.\nWord Limit: 25-35 words\nInstructions: Fit. Mention "looks factory".` },
    { category: "Auto Body", title: "Glass", prompt: `Context: Replaced windshield.\nWord Limit: 25-35 words\nInstructions: Glass. Mention "clear view".` },
    { category: "Auto Body", title: "Restoration", prompt: `Context: Classic car paint job.\nWord Limit: 40-50 words\nInstructions: Art. Mention "show quality".` },
    { category: "Auto Body", title: "Speed", prompt: `Context: Done ahead of schedule.\nWord Limit: 25-35 words\nInstructions: Time. Mention "fast turnaround".` },

    // ============================================
    // 40. AUTO DETAILING
    // ============================================
    { category: "Auto Detailing", title: "Full Detail", prompt: `Context: Interior and exterior.\nWord Limit: 30-40 words\nInstructions: Clean. Mention "showroom new".` },
    { category: "Auto Detailing", title: "Ceramic Coating", prompt: `Context: Protected paint.\nWord Limit: 35-45 words\nInstructions: Shine. Mention "mirror finish".` },
    { category: "Auto Detailing", title: "Interior", prompt: `Context: Shampooed carpets.\nWord Limit: 30-40 words\nInstructions: Fresh. Mention "smells new".` },
    { category: "Auto Detailing", title: "Mobile", prompt: `Context: Came to my office.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "easy".` },
    { category: "Auto Detailing", title: "Pet Hair", prompt: `Context: Removed dog hair.\nWord Limit: 30-40 words\nInstructions: Cleaning. Mention "hair gone".` },
    { category: "Auto Detailing", title: "Headlights", prompt: `Context: Restored cloudy headlights.\nWord Limit: 25-35 words\nInstructions: Clarity. Mention "clear".` },
    { category: "Auto Detailing", title: "Wash/Wax", prompt: `Context: Hand wax.\nWord Limit: 25-35 words\nInstructions: Protection. Mention "glossy".` },
    { category: "Auto Detailing", title: "Engine Bay", prompt: `Context: Cleaned engine.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "clean engine".` },
    { category: "Auto Detailing", title: "Odor", prompt: `Context: Removed smoke smell.\nWord Limit: 30-40 words\nInstructions: Scent. Mention "neutralized".` },
    { category: "Auto Detailing", title: "Monthly", prompt: `Context: Monthly maintenance plan.\nWord Limit: 25-35 words\nInstructions: Value. Mention "always clean".` },

    // ============================================
    // 41. TOWING
    // ============================================
    { category: "Towing", title: "Breakdown", prompt: `Context: Stuck on highway.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "arrived fast".` },
    { category: "Towing", title: "Flatbed", prompt: `Context: Towed luxury car.\nWord Limit: 25-35 words\nInstructions: Care. Mention "professional".` },
    { category: "Towing", title: "Jump Start", prompt: `Context: Dead battery.\nWord Limit: 20-30 words\nInstructions: Speed. Mention "saved the day".` },
    { category: "Towing", title: "Lockout", prompt: `Context: Keys in car.\nWord Limit: 25-35 words\nInstructions: Access. Mention "unlocked fast".` },
    { category: "Towing", title: "Winch Out", prompt: `Context: Stuck in ditch.\nWord Limit: 30-40 words\nInstructions: Rescue. Mention "careful recovery".` },
    { category: "Towing", title: "Long Distance", prompt: `Context: Towed to another city.\nWord Limit: 30-40 words\nInstructions: Transport. Mention "fair rate".` },
    { category: "Towing", title: "Tire Change", prompt: `Context: Changing flat tire.\nWord Limit: 25-35 words\nInstructions: Help. Mention "safe".` },
    { category: "Towing", title: "Motorcycle", prompt: `Context: Towed bike.\nWord Limit: 25-35 words\nInstructions: Specialty. Mention "secure tie down".` },
    { category: "Towing", title: "Price", prompt: `Context: Reasonable quote.\nWord Limit: 20-30 words\nInstructions: Value. Mention "fair price".` },
    { category: "Towing", title: "Driver", prompt: `Context: Driver was polite.\nWord Limit: 25-35 words\nInstructions: Personable. Mention "nice guy".` },

    // ============================================
    // 42. CABINET MAKER
    // ============================================
    { category: "Cabinet Maker", title: "Custom Kitchen", prompt: `Context: Built custom kitchen cabinets.\nWord Limit: 40-50 words\nInstructions: Craftsmanship. Mention "dream kitchen".` },
    { category: "Cabinet Maker", title: "Built-ins", prompt: `Context: Living room built-ins.\nWord Limit: 35-45 words\nInstructions: Detail. Mention "perfect fit".` },
    { category: "Cabinet Maker", title: "Vanity", prompt: `Context: Bathroom vanity.\nWord Limit: 30-40 words\nInstructions: Bathroom. Mention "high quality".` },
    { category: "Cabinet Maker", title: "Refacing", prompt: `Context: Refaced old cabinets.\nWord Limit: 30-40 words\nInstructions: Upgrade. Mention "new look".` },
    { category: "Cabinet Maker", title: "Closet", prompt: `Context: Custom closet system.\nWord Limit: 35-45 words\nInstructions: Organization. Mention "organized".` },
    { category: "Cabinet Maker", title: "Materials", prompt: `Context: Solid wood.\nWord Limit: 25-35 words\nInstructions: Quality. Mention "durable".` },
    { category: "Cabinet Maker", title: "Design", prompt: `Context: Helped design layout.\nWord Limit: 30-40 words\nInstructions: Design. Mention "functional".` },
    { category: "Cabinet Maker", title: "Installation", prompt: `Context: Install was flawless.\nWord Limit: 25-35 words\nInstructions: Install. Mention "professional".` },
    { category: "Cabinet Maker", title: "Hardware", prompt: `Context: Soft close hinges.\nWord Limit: 20-30 words\nInstructions: Feature. Mention "smooth".` },
    { category: "Cabinet Maker", title: "Office", prompt: `Context: Home office desk.\nWord Limit: 30-40 words\nInstructions: Work. Mention "productive".` },

    // ============================================
    // 43. COUNTERTOPS
    // ============================================
    { category: "Countertops", title: "Quartz Install", prompt: `Context: White quartz kitchen.\nWord Limit: 35-45 words\nInstructions: Look. Mention "stunning".` },
    { category: "Countertops", title: "Granite", prompt: `Context: Granite slab.\nWord Limit: 30-40 words\nInstructions: Nature. Mention "beautiful stone".` },
    { category: "Countertops", title: "Seam", prompt: `Context: Seam is invisible.\nWord Limit: 25-35 words\nInstructions: Skill. Mention "perfect seam".` },
    { category: "Countertops", title: "Template", prompt: `Context: Laser template.\nWord Limit: 25-35 words\nInstructions: Precision. Mention "perfect fit".` },
    { category: "Countertops", title: "Removal", prompt: `Context: Removed old tops.\nWord Limit: 25-35 words\nInstructions: Demo. Mention "clean".` },
    { category: "Countertops", title: "Bath Vanity", prompt: `Context: Marble vanity top.\nWord Limit: 30-40 words\nInstructions: Bath. Mention "elegant".` },
    { category: "Countertops", title: "Butcher Block", prompt: `Context: Wood island top.\nWord Limit: 30-40 words\nInstructions: Warmth. Mention "rich wood".` },
    { category: "Countertops", title: "Turnaround", prompt: `Context: Installed in 1 week.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "fast service".` },
    { category: "Countertops", title: "Sink", prompt: `Context: Undermount sink.\nWord Limit: 20-30 words\nInstructions: Install. Mention "clean lines".` },
    { category: "Countertops", title: "Repair", prompt: `Context: Fixed chip in granite.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "can't see it".` },

    // ============================================
    // 44. CONCRETE/MASONRY
    // ============================================
    { category: "Masonry", title: "Driveway", prompt: `Context: New concrete driveway.\nWord Limit: 35-45 words\nInstructions: Curb appeal. Mention "smooth finish".` },
    { category: "Masonry", title: "Patio", prompt: `Context: Stamped concrete patio.\nWord Limit: 35-45 words\nInstructions: Design. Mention "looks like stone".` },
    { category: "Masonry", title: "Walkway", prompt: `Context: Front walkway.\nWord Limit: 30-40 words\nInstructions: Entry. Mention "welcoming".` },
    { category: "Masonry", title: "Steps", prompt: `Context: Replaced crumbling steps.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "solid".` },
    { category: "Masonry", title: "Brick Work", prompt: `Context: Repointed brick wall.\nWord Limit: 30-40 words\nInstructions: Restoration. Mention "matches perfectly".` },
    { category: "Masonry", title: "Stone Veneer", prompt: `Context: Stone on foundation.\nWord Limit: 30-40 words\nInstructions: Look. Mention "expensive look".` },
    { category: "Masonry", title: "Garage Floor", prompt: `Context: Poured garage slab.\nWord Limit: 30-40 words\nInstructions: Base. Mention "level".` },
    { category: "Masonry", title: "Foundation", prompt: `Context: Addition foundation.\nWord Limit: 35-45 words\nInstructions: Structural. Mention "square and level".` },
    { category: "Masonry", title: "Chimney", prompt: `Context: Rebuilt chimney top.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "safe".` },
    { category: "Masonry", title: "Retaining Wall", prompt: `Context: Block wall.\nWord Limit: 30-40 words\nInstructions: Wall. Mention "strong".` },

    // ============================================
    // 45. PAVING
    // ============================================
    { category: "Paving", title: "Asphalt Drive", prompt: `Context: Paved driveway.\nWord Limit: 30-40 words\nInstructions: Smooth. Mention "looks new".` },
    { category: "Paving", title: "Sealcoating", prompt: `Context: Sealed driveway.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "protected".` },
    { category: "Paving", title: "Patching", prompt: `Context: Filled potholes.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "smooth".` },
    { category: "Paving", title: "Parking Lot", prompt: `Context: Commercial lot paving.\nWord Limit: 40-50 words\nInstructions: B2B. Mention "professional look".` },
    { category: "Paving", title: "Striping", prompt: `Context: Painted parking lines.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "crisp lines".` },
    { category: "Paving", title: "Extension", prompt: `Context: Widened driveway.\nWord Limit: 30-40 words\nInstructions: Project. Mention "more room".` },
    { category: "Paving", title: "Resurfacing", prompt: `Context: Overlay on old asphalt.\nWord Limit: 35-45 words\nInstructions: Renewal. Mention "brand new".` },
    { category: "Paving", title: "Edges", prompt: `Context: Clean edges.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "neat".` },
    { category: "Paving", title: "Drainage", prompt: `Context: Fixed puddling issue.\nWord Limit: 30-40 words\nInstructions: Function. Mention "drains well".` },
    { category: "Paving", title: "Recycled", prompt: `Context: Crushed asphalt.\nWord Limit: 25-35 words\nInstructions: Value. Mention "budget friendly".` },

    // ============================================
    // 46. WELDING
    // ============================================
    { category: "Welding", title: "Fence Repair", prompt: `Context: Welded iron fence.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "strong weld".` },
    { category: "Welding", title: "Trailer", prompt: `Context: Fixed boat trailer.\nWord Limit: 30-40 words\nInstructions: Utility. Mention "back on road".` },
    { category: "Welding", title: "Railing", prompt: `Context: Custom handrail.\nWord Limit: 35-45 words\nInstructions: Custom. Mention "beautiful work".` },
    { category: "Welding", title: "Structural", prompt: `Context: Steel beam support.\nWord Limit: 35-45 words\nInstructions: Safety. Mention "solid".` },
    { category: "Welding", title: "Mobile", prompt: `Context: Came to site.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "mobile welder".` },
    { category: "Welding", title: "Stainless", prompt: `Context: Stainless kitchen repair.\nWord Limit: 30-40 words\nInstructions: Specialty. Mention "clean finish".` },
    { category: "Welding", title: "Aluminum", prompt: `Context: Aluminum pontoon fix.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "difficult weld".` },
    { category: "Welding", title: "Gate", prompt: `Context: Fabricated driveway gate.\nWord Limit: 40-50 words\nInstructions: Project. Mention "secure".` },
    { category: "Welding", title: "Heavy Equipment", prompt: `Context: Welded excavator bucket.\nWord Limit: 30-40 words\nInstructions: Industrial. Mention "back to work".` },
    { category: "Welding", title: "Creative", prompt: `Context: Metal art piece.\nWord Limit: 30-40 words\nInstructions: Art. Mention "unique".` },

    // ============================================
    // 47. CHIMNEY SWEEP
    // ============================================
    { category: "Chimney", title: "Cleaning", prompt: `Context: Annual sweep. Clean.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "peace of mind".` },
    { category: "Chimney", title: "Inspection", prompt: `Context: Camera inspection.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "thorough".` },
    { category: "Chimney", title: "Cap Install", prompt: `Context: Installed chimney cap.\nWord Limit: 25-35 words\nInstructions: Protection. Mention "no animals".` },
    { category: "Chimney", title: "Tuckpointing", prompt: `Context: Fixed mortar joints.\nWord Limit: 30-40 words\nInstructions: Maintenance. Mention "looks new".` },
    { category: "Chimney", title: "Liner", prompt: `Context: Relined flue.\nWord Limit: 35-45 words\nInstructions: Safety. Mention "improved draft".` },
    { category: "Chimney", title: "Gas Logs", prompt: `Context: Installed gas logs.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "cozy".` },
    { category: "Chimney", title: "Crown Repair", prompt: `Context: Sealed cracked crown.\nWord Limit: 30-40 words\nInstructions: Water. Mention "leak stop".` },
    { category: "Chimney", title: "Creosote", prompt: `Context: Removed glaze creosote.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "fire safety".` },
    { category: "Chimney", title: "Damper", prompt: `Context: Fixed stuck damper.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "works great".` },
    { category: "Chimney", title: "Mess Free", prompt: `Context: No dust in house.\nWord Limit: 25-35 words\nInstructions: Clean. Mention "respectful".` },

    // ============================================
    // 48. SEPTIC SERVICE
    // ============================================
    { category: "Septic", title: "Pumping", prompt: `Context: Routine tank pump.\nWord Limit: 25-35 words\nInstructions: Maintenance. Mention "fast service".` },
    { category: "Septic", title: "Inspection", prompt: `Context: Real estate inspection.\nWord Limit: 30-40 words\nInstructions: Sale. Mention "thorough".` },
    { category: "Septic", title: "Repair", prompt: `Context: Fixed broken baffle.\nWord Limit: 30-40 words\nInstructions: Repair. Mention "fixed".` },
    { category: "Septic", title: "Field", prompt: `Context: Leach field issue.\nWord Limit: 35-45 words\nInstructions: Major. Mention "saved the field".` },
    { category: "Septic", title: "Riser", prompt: `Context: Installed riser lid.\nWord Limit: 25-35 words\nInstructions: Upgrade. Mention "easy access".` },
    { category: "Septic", title: "Filter", prompt: `Context: Cleaned e-filter.\nWord Limit: 20-30 words\nInstructions: Maintenance. Mention "clean".` },
    { category: "Septic", title: "Alarm", prompt: `Context: High water alarm fixed.\nWord Limit: 25-35 words\nInstructions: Tech. Mention "warning".` },
    { category: "Septic", title: "Excavation", prompt: `Context: Careful digging.\nWord Limit: 30-40 words\nInstructions: Care. Mention "saved grass".` },
    { category: "Septic", title: "Emergency", prompt: `Context: Backed up on holiday.\nWord Limit: 30-40 words\nInstructions: Emergency. Mention "lifesaver".` },
    { category: "Septic", title: "Education", prompt: `Context: Taught me how system works.\nWord Limit: 25-35 words\nInstructions: Help. Mention "informative".` },

    // ============================================
    // 49. UPHOLSTERY CLEANING
    // ============================================
    { category: "Upholstery", title: "Sofa Clean", prompt: `Context: Cleaned sectional.\nWord Limit: 30-40 words\nInstructions: Clean. Mention "looks new".` },
    { category: "Upholstery", title: "Stain Removal", prompt: `Context: Coffee stain.\nWord Limit: 25-35 words\nInstructions: Spot. Mention "gone".` },
    { category: "Upholstery", title: "Pet Odor", prompt: `Context: Dog smell removed.\nWord Limit: 30-40 words\nInstructions: Scent. Mention "fresh".` },
    { category: "Upholstery", title: "Chairs", prompt: `Context: Dining chairs.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "bright".` },
    { category: "Upholstery", title: "Leather", prompt: `Context: Cleaned and conditioned leather.\nWord Limit: 30-40 words\nInstructions: Care. Mention "soft".` },
    { category: "Upholstery", title: "Mattress", prompt: `Context: Sanitized mattress.\nWord Limit: 30-40 words\nInstructions: Health. Mention "clean sleep".` },
    { category: "Upholstery", title: "Car Interior", prompt: `Context: Car seats.\nWord Limit: 30-40 words\nInstructions: Auto. Mention "interior".` },
    { category: "Upholstery", title: "Fabric Protection", prompt: `Context: Applied scotchgard.\nWord Limit: 25-35 words\nInstructions: Prevent. Mention "protected".` },
    { category: "Upholstery", title: "Curtains", prompt: `Context: Drapes cleaned onsite.\nWord Limit: 30-40 words\nInstructions: Gentle. Mention "dust free".` },
    { category: "Upholstery", title: "Vintage", prompt: `Context: Antique chair.\nWord Limit: 30-40 words\nInstructions: Delicate. Mention "careful".` },

    // ============================================
    // 50. INSULATION
    // ============================================
    { category: "Insulation", title: "Attic Blown", prompt: `Context: Added blown-in insulation.\nWord Limit: 35-45 words\nInstructions: Efficiency. Mention "warmer house".` },
    { category: "Insulation", title: "Spray Foam", prompt: `Context: Spray foam in rim joists.\nWord Limit: 30-40 words\nInstructions: Seal. Mention "no drafts".` },
    { category: "Insulation", title: "Removal", prompt: `Context: Vacuumed old insulation.\nWord Limit: 30-40 words\nInstructions: Clean. Mention "clean attic".` },
    { category: "Insulation", title: "Crawlspace", prompt: `Context: Insulated floor joists.\nWord Limit: 35-45 words\nInstructions: Comfort. Mention "warm floors".` },
    { category: "Insulation", title: "Wall Injection", prompt: `Context: Insulated walls without demo.\nWord Limit: 35-45 words\nInstructions: Retrofit. Mention "quieter".` },
    { category: "Insulation", title: "Sound", prompt: `Context: Soundproof insulation.\nWord Limit: 30-40 words\nInstructions: Noise. Mention "peace and quiet".` },
    { category: "Insulation", title: "Batt", prompt: `Context: Installed fiberglass batts.\nWord Limit: 25-35 words\nInstructions: Install. Mention "neat".` },
    { category: "Insulation", title: "Rebate", prompt: `Context: Utility rebate help.\nWord Limit: 30-40 words\nInstructions: Value. Mention "cost effective".` },
    { category: "Insulation", title: "Ventilation", prompt: `Context: Added baffles for airflow.\nWord Limit: 30-40 words\nInstructions: Health. Mention "airflow".` },
    { category: "Insulation", title: "Garage Door", prompt: `Context: Insulated garage door kit.\nWord Limit: 25-35 words\nInstructions: DIY helper. Mention "warmer garage".` },

    // ============================================
    // 51. INTERIOR DESIGN
    // ============================================
    { category: "Interior Design", title: "Living Room", prompt: `Context: Redesigned living room layout.\nWord Limit: 30-40 words\nInstructions: Flow. Mention "functional".` },
    { category: "Interior Design", title: "Color Consult", prompt: `Context: Picked paint colors for whole house.\nWord Limit: 25-35 words\nInstructions: Palette. Mention "cohesive".` },
    { category: "Interior Design", title: "Full Renovation", prompt: `Context: Managed full remodel design.\nWord Limit: 40-50 words\nInstructions: Project. Mention "vision came to life".` },
    { category: "Interior Design", title: "Kitchen", prompt: `Context: Designed new kitchen layout.\nWord Limit: 30-40 words\nInstructions: Function. Mention "chef's kitchen".` },
    { category: "Interior Design", title: "Sourcing", prompt: `Context: Found unique furniture pieces.\nWord Limit: 25-35 words\nInstructions: Style. Mention "unique".` },
    { category: "Interior Design", title: "E-Design", prompt: `Context: Remote design service.\nWord Limit: 30-40 words\nInstructions: Convenience. Mention "easy process".` },
    { category: "Interior Design", title: "Commercial", prompt: `Context: Designed office lobby.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "impressive".` },
    { category: "Interior Design", title: "Staging", prompt: `Context: Staged home for sale.\nWord Limit: 30-40 words\nInstructions: Value. Mention "sold fast".` },
    { category: "Interior Design", title: "Window Treatments", prompt: `Context: Custom drapes and blinds.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "perfect fit".` },
    { category: "Interior Design", title: "Budget", prompt: `Context: Stayed within budget.\nWord Limit: 25-35 words\nInstructions: Value. Mention "great value".` },

    // ============================================
    // 52. GENERAL CONTRACTOR
    // ============================================
    { category: "General Contractor", title: "Home Addition", prompt: `Context: Built 500sqft addition.\nWord Limit: 40-50 words\nInstructions: Project. Mention "seamless integration".` },
    { category: "General Contractor", title: "Basement Reno", prompt: `Context: Finished basement.\nWord Limit: 35-45 words\nInstructions: Space. Mention "extra living space".` },
    { category: "General Contractor", title: "Garage Build", prompt: `Context: Detached garage build.\nWord Limit: 30-40 words\nInstructions: Build. Mention "solid construction".` },
    { category: "General Contractor", title: "ADU/Guest House", prompt: `Context: Built backyard cottage.\nWord Limit: 40-50 words\nInstructions: Detail. Mention "perfect for mom".` },
    { category: "General Contractor", title: "Commercial Fitout", prompt: `Context: Retail store buildout.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "on schedule".` },
    { category: "General Contractor", title: "Project Mgmt", prompt: `Context: Managed all subs perfectly.\nWord Limit: 30-40 words\nInstructions: Mgmt. Mention "stress free".` },
    { category: "General Contractor", title: "Communication", prompt: `Context: Daily updates on project.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "kept in loop".` },
    { category: "General Contractor", title: "Quality", prompt: `Context: High end finishes.\nWord Limit: 25-35 words\nInstructions: Craft. Mention "top notch".` },
    { category: "General Contractor", title: "Timeline", prompt: `Context: Finished 2 weeks early.\nWord Limit: 30-40 words\nInstructions: Speed. Mention "fast".` },
    { category: "General Contractor", title: "Budget", prompt: `Context: No hidden costs.\nWord Limit: 25-35 words\nInstructions: Money. Mention "on budget".` },

    // ============================================
    // 53. KITCHEN REMODEL
    // ============================================
    { category: "Kitchen Remodel", title: "Island Install", prompt: `Context: Added huge island.\nWord Limit: 30-40 words\nInstructions: Centerpiece. Mention "gathering spot".` },
    { category: "Kitchen Remodel", title: "Open Concept", prompt: `Context: Removed wall for open layout.\nWord Limit: 35-45 words\nInstructions: Space. Mention "huge difference".` },
    { category: "Kitchen Remodel", title: "Cabinets", prompt: `Context: Installed shaker cabinets.\nWord Limit: 30-40 words\nInstructions: Style. Mention "timeless".` },
    { category: "Kitchen Remodel", title: "Countertops", prompt: `Context: Quartz counters.\nWord Limit: 25-35 words\nInstructions: Surface. Mention "durable".` },
    { category: "Kitchen Remodel", title: "Lighting", prompt: `Context: Under cabinet lighting.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "bright".` },
    { category: "Kitchen Remodel", title: "Backsplash", prompt: `Context: Tile backsplash.\nWord Limit: 25-35 words\nInstructions: Art. Mention "beautiful".` },
    { category: "Kitchen Remodel", title: "Appliances", prompt: `Context: Integrated appliances.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "modern".` },
    { category: "Kitchen Remodel", title: "Flooring", prompt: `Context: Kitchen tile floor.\nWord Limit: 30-40 words\nInstructions: Base. Mention "easy clean".` },
    { category: "Kitchen Remodel", title: "Pantry", prompt: `Context: Built walk-in pantry.\nWord Limit: 25-35 words\nInstructions: Storage. Mention "organized".` },
    { category: "Kitchen Remodel", title: "Design", prompt: `Context: 3D rendering help.\nWord Limit: 30-40 words\nInstructions: Vision. Mention "helpful visualization".` },

    // ============================================
    // 54. BATHROOM REMODEL
    // ============================================
    { category: "Bathroom Remodel", title: "Master Bath", prompt: `Context: Spa-like master bath.\nWord Limit: 40-50 words\nInstructions: Luxury. Mention "retreat".` },
    { category: "Bathroom Remodel", title: "Tub to Shower", prompt: `Context: Converted tub to walk-in shower.\nWord Limit: 35-45 words\nInstructions: Accessibility. Mention "spacious".` },
    { category: "Bathroom Remodel", title: "Powder Room", prompt: `Context: Half bath update.\nWord Limit: 25-35 words\nInstructions: Small. Mention "cute".` },
    { category: "Bathroom Remodel", title: "Vanity", prompt: `Context: Double vanity install.\nWord Limit: 30-40 words\nInstructions: Storage. Mention "plenty of room".` },
    { category: "Bathroom Remodel", title: "Tile Work", prompt: `Context: Floor to ceiling tile.\nWord Limit: 35-45 words\nInstructions: Style. Mention "hotel feel".` },
    { category: "Bathroom Remodel", title: "Plumbing", prompt: `Context: Moved toilet location.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "better layout".` },
    { category: "Bathroom Remodel", title: "Heating", prompt: `Context: Heated floors.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "warm feet".` },
    { category: "Bathroom Remodel", title: "Soaking Tub", prompt: `Context: Freestanding tub.\nWord Limit: 30-40 words\nInstructions: Relax. Mention "centerpiece".` },
    { category: "Bathroom Remodel", title: "Ventilation", prompt: `Context: Silent fan install.\nWord Limit: 20-30 words\nInstructions: Air. Mention "no steam".` },
    { category: "Bathroom Remodel", title: "Mirror", prompt: `Context: LED lighted mirror.\nWord Limit: 25-35 words\nInstructions: Tech. Mention "modern".` },

    // ============================================
    // 55. GARAGE ORGANIZATION
    // ============================================
    { category: "Garage Organization", title: "Cabinets", prompt: `Context: Wall of storage cabinets.\nWord Limit: 30-40 words\nInstructions: Storage. Mention "hid the clutter".` },
    { category: "Garage Organization", title: "Slatwall", prompt: `Context: Slatwall for tools.\nWord Limit: 25-35 words\nInstructions: Organization. Mention "everything has a place".` },
    { category: "Garage Organization", title: "Overhead", prompt: `Context: Ceiling racks.\nWord Limit: 25-35 words\nInstructions: Space. Mention "stored holiday bins".` },
    { category: "Garage Organization", title: "Flooring", prompt: `Context: Polyaspartic floor.\nWord Limit: 30-40 words\nInstructions: Clean. Mention "easy to sweep".` },
    { category: "Garage Organization", title: "Workbench", prompt: `Context: Custom workbench.\nWord Limit: 25-35 words\nInstructions: Work. Mention "sturdy".` },
    { category: "Garage Organization", title: "Bike Rack", prompt: `Context: Bike lift system.\nWord Limit: 20-30 words\nInstructions: Bike. Mention "out of way".` },
    { category: "Garage Organization", title: "Lighting", prompt: `Context: LED shop lghts.\nWord Limit: 25-35 words\nInstructions: Light. Mention "bright".` },
    { category: "Garage Organization", title: "Design", prompt: `Context: 3D garage design.\nWord Limit: 30-40 words\nInstructions: Plan. Mention "visualized".` },
    { category: "Garage Organization", title: "Install", prompt: `Context: Done in 1 day.\nWord Limit: 20-30 words\nInstructions: Speed. Mention "fast".` },
    { category: "Garage Organization", title: "Value", prompt: `Context: Added home value.\nWord Limit: 25-35 words\nInstructions: ROI. Mention "worth it".` },

    // ============================================
    // 56. SMART HOME
    // ============================================
    { category: "Smart Home", title: "Whole House", prompt: `Context: Control4 system install.\nWord Limit: 40-50 words\nInstructions: Tech. Mention "seamless control".` },
    { category: "Smart Home", title: "Lighting", prompt: `Context: Smart switches (Lutron).\nWord Limit: 30-40 words\nInstructions: Light. Mention "voice control".` },
    { category: "Smart Home", title: "Thermostat", prompt: `Context: Ecobee install.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "energy saving".` },
    { category: "Smart Home", title: "Locks", prompt: `Context: Keyless entry setup.\nWord Limit: 25-35 words\nInstructions: Access. Mention "never locked out".` },
    { category: "Smart Home", title: "Cameras", prompt: `Context: Security cameras.\nWord Limit: 30-40 words\nInstructions: Security. Mention "phone access".` },
    { category: "Smart Home", title: "Audio", prompt: `Context: Whole home audio (Sonos).\nWord Limit: 35-45 words\nInstructions: Fun. Mention "music everywhere".` },
    { category: "Smart Home", title: "Blinds", prompt: `Context: Motorized shades.\nWord Limit: 30-40 words\nInstructions: Luxury. Mention "wake up with sun".` },
    { category: "Smart Home", title: "Network", prompt: `Context: Mesh WiFi setup.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "no dead zones".` },
    { category: "Smart Home", title: "Theater", prompt: `Context: Home theater control.\nWord Limit: 35-45 words\nInstructions: Movie. Mention "one button".` },
    { category: "Smart Home", title: "Support", prompt: `Context: Tech support help.\nWord Limit: 25-35 words\nInstructions: Help. Mention "patient".` },

    // ============================================
    // 57. HOME SECURITY
    // ============================================
    { category: "Home Security", title: "System Install", prompt: `Context: Installed alarm sensors.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "secure".` },
    { category: "Home Security", title: "Cameras", prompt: `Context: 4K outdoor cameras.\nWord Limit: 30-40 words\nInstructions: Clarity. Mention "face ID".` },
    { category: "Home Security", title: "Monitoring", prompt: `Context: 24/7 monitoring service.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "sleep better".` },
    { category: "Home Security", title: "Doorbell", prompt: `Context: Video doorbell.\nWord Limit: 20-30 words\nInstructions: Access. Mention "knows who is there".` },
    { category: "Home Security", title: "Fire", prompt: `Context: Monitored smoke detectors.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "fast response".` },
    { category: "Home Security", title: "App", prompt: `Context: Easy to use app.\nWord Limit: 20-30 words\nInstructions: UI. Mention "simple".` },
    { category: "Home Security", title: "Commercial", prompt: `Context: Store security system.\nWord Limit: 35-45 words\nInstructions: B2B. Mention "employee safety".` },
    { category: "Home Security", title: "Upgrade", prompt: `Context: Upgraded old wired system.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "modern".` },
    { category: "Home Security", title: "Sensors", prompt: `Context: Glass break sensors.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "full coverage".` },
    { category: "Home Security", title: "Service", prompt: `Context: Technician was knowledgeable.\nWord Limit: 25-35 words\nInstructions: People. Mention "expert".` },

    // ============================================
    // 58. IT SUPPORT
    // ============================================
    { category: "IT Support", title: "Virus Removal", prompt: `Context: Cleaned infected laptop.\nWord Limit: 30-40 words\nInstructions: Fix. Mention "saved my files".` },
    { category: "IT Support", title: "Network", prompt: `Context: Fixed office WiFi.\nWord Limit: 30-40 words\nInstructions: Speed. Mention "stable connection".` },
    { category: "IT Support", title: "Data Recovery", prompt: `Context: Recovered photos from dead drive.\nWord Limit: 35-45 words\nInstructions: Miracle. Mention "priceless memories".` },
    { category: "IT Support", title: "Setup", prompt: `Context: Set up new computer.\nWord Limit: 25-35 words\nInstructions: Start. Mention "ready to use".` },
    { category: "IT Support", title: "Email", prompt: `Context: Migrated email to cloud.\nWord Limit: 30-40 words\nInstructions: Business. Mention "smooth transition".` },
    { category: "IT Support", title: "Backup", prompt: `Context: Managed backup solution.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "secure data".` },
    { category: "IT Support", title: "Server", prompt: `Context: Server maintenance.\nWord Limit: 30-40 words\nInstructions: B2B. Mention "zero downtime".` },
    { category: "IT Support", title: "Printer", prompt: `Context: Fixed network printer.\nWord Limit: 20-30 words\nInstructions: Fix. Mention "finally prints".` },
    { category: "IT Support", title: "Remote", prompt: `Context: Fixed issue remotely.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "fast help".` },
    { category: "IT Support", title: "Training", prompt: `Context: Taught staff cybersecurity.\nWord Limit: 30-40 words\nInstructions: Education. Mention "eye opening".` },

    // ============================================
    // 59. COMPUTER REPAIR
    // ============================================
    { category: "Computer Repair", title: "Screen Replace", prompt: `Context: Crack MacBook screen.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "brand new".` },
    { category: "Computer Repair", title: "Battery", prompt: `Context: Replaced laptop battery.\nWord Limit: 20-30 words\nInstructions: Power. Mention "holds charge".` },
    { category: "Computer Repair", title: "Slow PC", prompt: `Context: Sped up old computer (SSD).\nWord Limit: 30-40 words\nInstructions: Upgrade. Mention "like new speed".` },
    { category: "Computer Repair", title: "Keyboard", prompt: `Context: Replaced sticky keyboard.\nWord Limit: 25-35 words\nInstructions: Fix. Mention "types perfect".` },
    { category: "Computer Repair", title: "Gaming PC", prompt: `Context: Built custom gaming rig.\nWord Limit: 35-45 words\nInstructions: Performance. Mention "cable management".` },
    { category: "Computer Repair", title: "Water Damage", prompt: `Context: Spilled coffee on laptop.\nWord Limit: 30-40 words\nInstructions: Save. Mention "cleaned it out".` },
    { category: "Computer Repair", title: "Hinge", prompt: `Context: Fixed broken laptop hinge.\nWord Limit: 25-35 words\nInstructions: Hardware. Mention "sturdy".` },
    { category: "Computer Repair", title: "Charging Port", prompt: `Context: Soldered new charging port.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "charges again".` },
    { category: "Computer Repair", title: "Overheating", prompt: `Context: Cleaned fans and thermal paste.\nWord Limit: 25-35 words\nInstructions: Maint. Mention "runs cool".` },
    { category: "Computer Repair", title: "Used PC", prompt: `Context: Bought refurbished laptop.\nWord Limit: 25-35 words\nInstructions: Value. Mention "great deal".` },

    // ============================================
    // 60. WEB DESIGN
    // ============================================
    { category: "Web Design", title: "New Website", prompt: `Context: Launched business site.\nWord Limit: 30-40 words\nInstructions: Launch. Mention "professional look".` },
    { category: "Web Design", title: "Redesign", prompt: `Context: Updated 10 year old site.\nWord Limit: 35-45 words\nInstructions: Update. Mention "mobile friendly".` },
    { category: "Web Design", title: "Ecommerce", prompt: `Context: Online store setup.\nWord Limit: 30-40 words\nInstructions: Sales. Mention "easy checkout".` },
    { category: "Web Design", title: "SEO", prompt: `Context: Site ranks higher now.\nWord Limit: 25-35 words\nInstructions: Results. Mention "more calls".` },
    { category: "Web Design", title: "Speed", prompt: `Context: Made site load fast.\nWord Limit: 25-35 words\nInstructions: Performance. Mention "instant load".` },
    { category: "Web Design", title: "Logo", prompt: `Context: Designed logo too.\nWord Limit: 25-35 words\nInstructions: Branding. Mention "matches identity".` },
    { category: "Web Design", title: "Maintenance", prompt: `Context: Monthly site care.\nWord Limit: 20-30 words\nInstructions: Care. Mention "worry free".` },
    { category: "Web Design", title: "Booking", prompt: `Context: Added booking calendar.\nWord Limit: 30-40 words\nInstructions: Feature. Mention "clients love it".` },
    { category: "Web Design", title: "Copywriting", prompt: `Context: Wrote the site text.\nWord Limit: 30-40 words\nInstructions: Content. Mention "compelling".` },
    { category: "Web Design", title: "Support", prompt: `Context: Quick to make edits.\nWord Limit: 20-30 words\nInstructions: Service. Mention "responsive".` },

    // ============================================
    // 61. SEO SERVICE
    // ============================================
    { category: "SEO", title: "Ranking", prompt: `Context: Got to page 1 of Google.\nWord Limit: 30-40 words\nInstructions: Result. Mention "highly visible".` },
    { category: "SEO", title: "Local", prompt: `Context: Optimized Google Map profile.\nWord Limit: 30-40 words\nInstructions: Local. Mention "more foot traffic".` },
    { category: "SEO", title: "Content", prompt: `Context: Wrote blog posts.\nWord Limit: 25-35 words\nInstructions: Strategy. Mention "informative".` },
    { category: "SEO", title: "Audit", prompt: `Context: Technical site audit.\nWord Limit: 30-40 words\nInstructions: Fix. Mention "found errors".` },
    { category: "SEO", title: "Backlinks", prompt: `Context: Built quality links.\nWord Limit: 25-35 words\nInstructions: Authority. Mention "domain authority".` },
    { category: "SEO", title: "Reporting", prompt: `Context: Monthly ranking reports.\nWord Limit: 25-35 words\nInstructions: Transparency. Mention "clear progress".` },
    { category: "SEO", title: "PPC", prompt: `Context: Managed Adwords too.\nWord Limit: 30-40 words\nInstructions: Ads. Mention "good ROI".` },
    { category: "SEO", title: "Communication", prompt: `Context: Explains things clearly.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "no jargon".` },
    { category: "SEO", title: "Growth", prompt: `Context: Business doubled.\nWord Limit: 30-40 words\nInstructions: Success. Mention "growth partner".` },
    { category: "SEO", title: "Keyword", prompt: `Context: Ranked for specific niche.\nWord Limit: 25-35 words\nInstructions: Target. Mention "right customers".` },

    // ============================================
    // 62. GRAPHIC DESIGN
    // ============================================
    { category: "Graphic Design", title: "Logo", prompt: `Context: Created new brand logo.\nWord Limit: 30-40 words\nInstructions: Brand. Mention "modern".` },
    { category: "Graphic Design", title: "Brochure", prompt: `Context: Designed sales brochure.\nWord Limit: 25-35 words\nInstructions: Print. Mention "professional".` },
    { category: "Graphic Design", title: "Social", prompt: `Context: Social media templates.\nWord Limit: 25-35 words\nInstructions: Digital. Mention "on brand".` },
    { category: "Graphic Design", title: "Packaging", prompt: `Context: Product packaging design.\nWord Limit: 35-45 words\nInstructions: Retail. Mention "stands out".` },
    { category: "Graphic Design", title: "Business Card", prompt: `Context: Unique business cards.\nWord Limit: 20-30 words\nInstructions: Netoworking. Mention "memorable".` },
    { category: "Graphic Design", title: "Menu", prompt: `Context: Restaurant menu layout.\nWord Limit: 30-40 words\nInstructions: Food. Mention "easy to read".` },
    { category: "Graphic Design", title: "Rebrand", prompt: `Context: Total rebranding.\nWord Limit: 35-45 words\nInstructions: Shift. Mention "fresh image".` },
    { category: "Graphic Design", title: "Illustration", prompt: `Context: Custom illustration.\nWord Limit: 30-40 words\nInstructions: Art. Mention "talented".` },
    { category: "Graphic Design", title: "Speed", prompt: `Context: Fast revisions.\nWord Limit: 20-30 words\nInstructions: Service. Mention "quick".` },
    { category: "Graphic Design", title: "Creativity", prompt: `Context: Understood my vision.\nWord Limit: 25-35 words\nInstructions: Empathy. Mention "nailed it".` },

    // ============================================
    // 63. PRINTING
    // ============================================
    { category: "Printing", title: "Flyers", prompt: `Context: Printed 1000 flyers.\nWord Limit: 25-35 words\nInstructions: Quality. Mention "crisp colors".` },
    { category: "Printing", title: "Banners", prompt: `Context: Vinyl banner for event.\nWord Limit: 25-35 words\nInstructions: Material. Mention "durable".` },
    { category: "Printing", title: "Booklets", prompt: `Context: Bound booklets.\nWord Limit: 30-40 words\nInstructions: Finish. Mention "professional binding".` },
    { category: "Printing", title: "Rush Job", prompt: `Context: Needed next day.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "fast turnaround".` },
    { category: "Printing", title: "Blueprints", prompt: `Context: Architectural plans.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "accurate".` },
    { category: "Printing", title: "Stickers", prompt: `Context: Die cut stickers.\nWord Limit: 25-35 words\nInstructions: Fun. Mention "high quality".` },
    { category: "Printing", title: "Mailing", prompt: `Context: Direct mail service.\nWord Limit: 30-40 words\nInstructions: Service. Mention "handled everything".` },
    { category: "Printing", title: "Design Help", prompt: `Context: Fixed my file formatting.\nWord Limit: 30-40 words\nInstructions: Help. Mention "saved the print".` },
    { category: "Printing", title: "Posters", prompt: `Context: Large format posters.\nWord Limit: 25-35 words\nInstructions: Size. Mention "vibrant".` },
    { category: "Printing", title: "Price", prompt: `Context: Volume discount.\nWord Limit: 20-30 words\nInstructions: Value. Mention "good price".` },

    // ============================================
    // 64. SIGN SHOP
    // ============================================
    { category: "Sign Shop", title: "Storefront", prompt: `Context: Channel letter sign.\nWord Limit: 35-45 words\nInstructions: Visibility. Mention "bright at night".` },
    { category: "Sign Shop", title: "Vehicle Wrap", prompt: `Context: Wrapped company van.\nWord Limit: 35-45 words\nInstructions: Mobile Ad. Mention "head turner".` },
    { category: "Sign Shop", title: "Lawn Signs", prompt: `Context: Yard signs.\nWord Limit: 25-35 words\nInstructions: Campaign. Mention "sturdy".` },
    { category: "Sign Shop", title: "Window Decal", prompt: `Context: Window perf.\nWord Limit: 30-40 words\nInstructions: Privacy. Mention "looks professional".` },
    { category: "Sign Shop", title: "Monument", prompt: `Context: Monument sign at street.\nWord Limit: 30-40 words\nInstructions: Install. Mention "quality build".` },
    { category: "Sign Shop", title: "Indoor", prompt: `Context: Lobby logo sign.\nWord Limit: 25-35 words\nInstructions: Interior. Mention "3D lettering".` },
    { category: "Sign Shop", title: "Permit", prompt: `Context: Handled city permit.\nWord Limit: 30-40 words\nInstructions: Admin. Mention "hassle free".` },
    { category: "Sign Shop", title: "Repair", prompt: `Context: Fixed broken sign light.\nWord Limit: 25-35 words\nInstructions: Maint. Mention "bright again".` },
    { category: "Sign Shop", title: "Design", prompt: `Context: Designed the layout.\nWord Limit: 30-40 words\nInstructions: Creative. Mention "eye catching".` },
    { category: "Sign Shop", title: "Installation", prompt: `Context: Install with bucket truck.\nWord Limit: 25-35 words\nInstructions: Safe. Mention "pro install".` },

    // ============================================
    // 65. PHOTOGRAPHER
    // ============================================
    { category: "Photographer", title: "Wedding", prompt: `Context: Photographed wedding.\nWord Limit: 40-50 words\nInstructions: Memory. Mention "captured the moment".` },
    { category: "Photographer", title: "Family", prompt: `Context: Family portraits.\nWord Limit: 30-40 words\nInstructions: Fun. Mention "great with kids".` },
    { category: "Photographer", title: "Headshot", prompt: `Context: Corporate headshots.\nWord Limit: 25-35 words\nInstructions: Professional. Mention "professional look".` },
    { category: "Photographer", title: "Real Estate", prompt: `Context: House photos.\nWord Limit: 30-40 words\nInstructions: Sale. Mention "made house look big".` },
    { category: "Photographer", title: "Product", prompt: `Context: Product photography.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "crisp".` },
    { category: "Photographer", title: "Event", prompt: `Context: Corporate event coverage.\nWord Limit: 30-40 words\nInstructions: Candid. Mention "unintrusive".` },
    { category: "Photographer", title: "Newborn", prompt: `Context: Baby photos.\nWord Limit: 35-45 words\nInstructions: Patience. Mention "gentle".` },
    { category: "Photographer", title: "Engagement", prompt: `Context: Surprise proposal.\nWord Limit: 35-45 words\nInstructions: Emotion. Mention "magical".` },
    { category: "Photographer", title: "Editing", prompt: `Context: Fast edits.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "delivered quickly".` },
    { category: "Photographer", title: "Studio", prompt: `Context: Studio session.\nWord Limit: 25-35 words\nInstructions: Lighting. Mention "great lighting".` },

    // ============================================
    // 66. VIDEOGRAPHER
    // ============================================
    { category: "Videographer", title: "Commercial", prompt: `Context: Produced TV commercial.\nWord Limit: 40-50 words\nInstructions: Production. Mention "high quality".` },
    { category: "Videographer", title: "Wedding", prompt: `Context: Wedding highlight reel.\nWord Limit: 35-45 words\nInstructions: Emotion. Mention "cried watching it".` },
    { category: "Videographer", title: "Drone", prompt: `Context: Drone footage.\nWord Limit: 25-35 words\nInstructions: View. Mention "cinematic".` },
    { category: "Videographer", title: "Interview", prompt: `Context: Corporate interviews.\nWord Limit: 30-40 words\nInstructions: Audio. Mention "great sound".` },
    { category: "Videographer", title: "Real Estate", prompt: `Context: Video home tour.\nWord Limit: 30-40 words\nInstructions: Sale. Mention "smooth walkthru".` },
    { category: "Videographer", title: "Music Video", prompt: `Context: Band music video.\nWord Limit: 35-45 words\nInstructions: Creative. Mention "visionary".` },
    { category: "Videographer", title: "Social", prompt: `Context: Reels/TikTok clips.\nWord Limit: 25-35 words\nInstructions: Viral. Mention "engaging".` },
    { category: "Videographer", title: "Training", prompt: `Context: Training videos.\nWord Limit: 30-40 words\nInstructions: Clarity. Mention "clear instruction".` },
    { category: "Videographer", title: "Live", prompt: `Context: Livestream event.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "reliable stream".` },
    { category: "Videographer", title: "Editing", prompt: `Context: Edited old footage.\nWord Limit: 25-35 words\nInstructions: Story. Mention "great storytelling".` },

    // ============================================
    // 67. EVENT PLANNER
    // ============================================
    { category: "Event Planner", title: "Wedding", prompt: `Context: Full wedding planning.\nWord Limit: 40-50 words\nInstructions: Stress. Mention "stress free day".` },
    { category: "Event Planner", title: "Corporate", prompt: `Context: Company holiday party.\nWord Limit: 35-45 words\nInstructions: Fun. Mention "well organized".` },
    { category: "Event Planner", title: "Birthday", prompt: `Context: 50th birthday bash.\nWord Limit: 30-40 words\nInstructions: Party. Mention "great theme".` },
    { category: "Event Planner", title: "Coordination", prompt: `Context: Day-of coordinator.\nWord Limit: 35-45 words\nInstructions: Help. Mention "kept timeline".` },
    { category: "Event Planner", title: "Decor", prompt: `Context: Sourced decorations.\nWord Limit: 30-40 words\nInstructions: Style. Mention "beautiful".` },
    { category: "Event Planner", title: "Vendors", prompt: `Context: Recommended great vendors.\nWord Limit: 30-40 words\nInstructions: Network. Mention "great team".` },
    { category: "Event Planner", title: "Budget", prompt: `Context: Saved money on contracts.\nWord Limit: 30-40 words\nInstructions: Value. Mention "negotiated".` },
    { category: "Event Planner", title: "Crisis", prompt: `Context: Handled rain plan.\nWord Limit: 35-45 words\nInstructions: Pro. Mention "saved the day".` },
    { category: "Event Planner", title: "Fundraiser", prompt: `Context: Charity gala.\nWord Limit: 35-45 words\nInstructions: Money. Mention "successful event".` },
    { category: "Event Planner", title: "Proposal", prompt: `Context: Planning proposal.\nWord Limit: 30-40 words\nInstructions: Specialized. Mention "she said yes".` },

    // ============================================
    // 68. CATERING
    // ============================================
    { category: "Catering", title: "Wedding", prompt: `Context: Plated wedding dinner.\nWord Limit: 35-45 words\nInstructions: Food. Mention "hot and delicious".` },
    { category: "Catering", title: "Buffet", prompt: `Context: Corporate lunch buffet.\nWord Limit: 30-40 words\nInstructions: Variety. Mention "fresh options".` },
    { category: "Catering", title: "BBQ", prompt: `Context: Backyard BBQ catering.\nWord Limit: 30-40 words\nInstructions: Taste. Mention "smoked brisket".` },
    { category: "Catering", title: "Cocktail", prompt: `Context: Appetizers and drinks.\nWord Limit: 30-40 words\nInstructions: Service. Mention "great servers".` },
    { category: "Catering", title: "Drop Off", prompt: `Context: Dropped off food pans.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "on time".` },
    { category: "Catering", title: "Dietary", prompt: `Context: Vegan/Gluten free options.\nWord Limit: 30-40 words\nInstructions: Needs. Mention "accommodating".` },
    { category: "Catering", title: "Dessert", prompt: `Context: Dessert table.\nWord Limit: 25-35 words\nInstructions: Sweet. Mention "stunning".` },
    { category: "Catering", title: "Bartending", prompt: `Context: Hired bartender too.\nWord Limit: 30-40 words\nInstructions: Drinks. Mention "great cocktails".` },
    { category: "Catering", title: "Tasting", prompt: `Context: Food tasting session.\nWord Limit: 25-35 words\nInstructions: Exp. Mention "fun".` },
    { category: "Catering", title: "Clean Up", prompt: `Context: Left kitchen spotless.\nWord Limit: 25-35 words\nInstructions: Service. Mention "clean".` },

    // ============================================
    // 69. DJ
    // ============================================
    { category: "DJ", title: "Wedding", prompt: `Context: Wedding reception.\nWord Limit: 35-45 words\nInstructions: Dance. Mention "packed dance floor".` },
    { category: "DJ", title: "Emcee", prompt: `Context: Announcements.\nWord Limit: 30-40 words\nInstructions: Voice. Mention "great energy".` },
    { category: "DJ", title: "Playlist", prompt: `Context: Played my requests.\nWord Limit: 25-35 words\nInstructions: Music. Mention "listened to us".` },
    { category: "DJ", title: "Lighting", prompt: `Context: Brought dance lights.\nWord Limit: 25-35 words\nInstructions: Atmosphere. Mention "fun lights".` },
    { category: "DJ", title: "Corporate", prompt: `Context: Company party music.\nWord Limit: 30-40 words\nInstructions: Pro. Mention "appropriate music".` },
    { category: "DJ", title: "School Dance", prompt: `Context: Prom DJ.\nWord Limit: 30-40 words\nInstructions: Teens. Mention "kids loved it".` },
    { category: "DJ", title: "Equipment", prompt: `Context: Sound quality.\nWord Limit: 25-35 words\nInstructions: Tech. Mention "crisp sound".` },
    { category: "DJ", title: "Karaoke", prompt: `Context: Karaoke setup.\nWord Limit: 30-40 words\nInstructions: Fun. Mention "huge hit".` },
    { category: "DJ", title: "Setup", prompt: `Context: On time setup.\nWord Limit: 20-30 words\nInstructions: Reliable. Mention "early".` },
    { category: "DJ", title: "Price", prompt: `Context: Affordable rate.\nWord Limit: 25-35 words\nInstructions: Value. Mention "great value".` },

    // ============================================
    // 70. FLORIST
    // ============================================
    { category: "Florist", title: "Wedding", prompt: `Context: Bridal bouquet and centerpieces.\nWord Limit: 40-50 words\nInstructions: Beauty. Mention "stunning flowers".` },
    { category: "Florist", title: "Delivery", prompt: `Context: Birthday delivery.\nWord Limit: 25-35 words\nInstructions: Service. Mention "on time".` },
    { category: "Florist", title: "Sympathy", prompt: `Context: Funeral arrangement.\nWord Limit: 30-40 words\nInstructions: Care. Mention "beautiful tribute".` },
    { category: "Florist", title: "Rose", prompt: `Context: Dozen red roses.\nWord Limit: 20-30 words\nInstructions: Fresh. Mention "long lasting".` },
    { category: "Florist", title: "Custom", prompt: `Context: Custom arrangement.\nWord Limit: 30-40 words\nInstructions: Art. Mention "unique".` },
    { category: "Florist", title: "Valentine", prompt: `Context: Holiday rush.\nWord Limit: 30-40 words\nInstructions: Busy. Mention "delivered anyway".` },
    { category: "Florist", title: "Subscription", prompt: `Context: Monthly flowers.\nWord Limit: 25-35 words\nInstructions: Gift. Mention "wife loves it".` },
    { category: "Florist", title: "Prom", prompt: `Context: Corsage and boutonniere.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "perfect match".` },
    { category: "Florist", title: "Plant", prompt: `Context: Potted office plant.\nWord Limit: 25-35 words\nInstructions: Life. Mention "healthy".` },
    { category: "Florist", title: "Preservation", prompt: `Context: Dried flower keepsake.\nWord Limit: 30-40 words\nInstructions: Memory. Mention "keepsake".` },

    // ============================================
    // 71. REAL ESTATE AGENT
    // ============================================
    { category: "Real Estate", title: "Buyer", prompt: `Context: Helped buy first home.\nWord Limit: 35-45 words\nInstructions: Guidance. Mention "never pushed".` },
    { category: "Real Estate", title: "Seller", prompt: `Context: Sold house in 3 days.\nWord Limit: 35-45 words\nInstructions: Results. Mention "over asking".` },
    { category: "Real Estate", title: "Negotiation", prompt: `Context: Negotiated repairs.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "tough negotiator".` },
    { category: "Real Estate", title: "Staging", prompt: `Context: Advice on staging.\nWord Limit: 30-40 words\nInstructions: Help. Mention "made difference".` },
    { category: "Real Estate", title: "Market Knowledge", prompt: `Context: Knew the neighborhood.\nWord Limit: 30-40 words\nInstructions: Expertise. Mention "local expert".` },
    { category: "Real Estate", title: "Communication", prompt: `Context: Always answered phone.\nWord Limit: 25-35 words\nInstructions: Service. Mention "responsive".` },
    { category: "Real Estate", title: "Paperwork", prompt: `Context: Explained contracts.\nWord Limit: 30-40 words\nInstructions: Clarity. Mention "made easy".` },
    { category: "Real Estate", title: "Relocation", prompt: `Context: Moving from out of state.\nWord Limit: 35-45 words\nInstructions: Remote. Mention "video tours".` },
    { category: "Real Estate", title: "Investment", prompt: `Context: Bought rental property.\nWord Limit: 30-40 words\nInstructions: ROI. Mention "investment data".` },
    { category: "Real Estate", title: "Luxury", prompt: `Context: High end listing.\nWord Limit: 35-45 words\nInstructions: Marketing. Mention "luxury marketing".` },

    // ============================================
    // 72. MORTGAGE BROKER
    // ============================================
    { category: "Mortgage", title: "First Time", prompt: `Context: First time buyer loan.\nWord Limit: 35-45 words\nInstructions: Education. Mention "patient".` },
    { category: "Mortgage", title: "Refinance", prompt: `Context: Lowered interest rate.\nWord Limit: 30-40 words\nInstructions: Savings. Mention "simple process".` },
    { category: "Mortgage", title: "Rate", prompt: `Context: Beat bank rate.\nWord Limit: 25-35 words\nInstructions: Value. Mention "best rate".` },
    { category: "Mortgage", title: "Closing", prompt: `Context: Closed on time.\nWord Limit: 30-40 words\nInstructions: Reliability. Mention "smooth closing".` },
    { category: "Mortgage", title: "Communication", prompt: `Context: Kept me updated.\nWord Limit: 25-35 words\nInstructions: Service. Mention "responsive".` },
    { category: "Mortgage", title: "Self Employed", prompt: `Context: Loan for business owner.\nWord Limit: 35-45 words\nInstructions: Difficult. Mention "made it happen".` },
    { category: "Mortgage", title: "VA Loan", prompt: `Context: Veteran loan expertise.\nWord Limit: 30-40 words\nInstructions: Special. Mention "knows VA".` },
    { category: "Mortgage", title: "Pre-Approval", prompt: `Context: Fast pre-approval letter.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "weekend help".` },
    { category: "Mortgage", title: "Fees", prompt: `Context: Low closing costs.\nWord Limit: 25-35 words\nInstructions: Money. Mention "transparent".` },
    { category: "Mortgage", title: "Creative", prompt: `Context: Complex financial situation.\nWord Limit: 35-45 words\nInstructions: Solution. Mention "problem solver".` },

    // ============================================
    // 73. HAIR SALON
    // ============================================
    { category: "Hair Salon", title: "Cut", prompt: `Context: Haircut and style.\nWord Limit: 25-35 words\nInstructions: Look. Mention "love my layers".` },
    { category: "Hair Salon", title: "Color", prompt: `Context: Balayage color.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "natural look".` },
    { category: "Hair Salon", title: "Correction", prompt: `Context: Fixed bad home dye.\nWord Limit: 35-45 words\nInstructions: Save. Mention "miracle worker".` },
    { category: "Hair Salon", title: "Blowout", prompt: `Context: Wash and blowout.\nWord Limit: 25-35 words\nInstructions: Style. Mention "bouncy".` },
    { category: "Hair Salon", title: "Extensions", prompt: `Context: Installed extensions.\nWord Limit: 30-40 words\nInstructions: Detail. Mention "blended perfectly".` },
    { category: "Hair Salon", title: "Kids", prompt: `Context: Toddler haircut.\nWord Limit: 25-35 words\nInstructions: Patience. Mention "good with kids".` },
    { category: "Hair Salon", title: "Atmosphere", prompt: `Context: Salon vibe.\nWord Limit: 25-35 words\nInstructions: Relax. Mention "coffee and music".` },
    { category: "Hair Salon", title: "Products", prompt: `Context: Recommended shampoo.\nWord Limit: 25-35 words\nInstructions: Care. Mention "hair feels healthy".` },
    { category: "Hair Salon", title: "Curly", prompt: `Context: Curly hair cut.\nWord Limit: 30-40 words\nInstructions: Specialty. Mention "knows curls".` },
    { category: "Hair Salon", title: "Updo", prompt: `Context: Prom updo.\nWord Limit: 25-35 words\nInstructions: Event. Mention "stayed all night".` },

    // ============================================
    // 74. BARBER SHOP
    // ============================================
    { category: "Barber", title: "Fade", prompt: `Context: Skin fade haircut.\nWord Limit: 25-35 words\nInstructions: Skill. Mention "clean fade".` },
    { category: "Barber", title: "Beard Trim", prompt: `Context: Beard shape up.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "sharp lines".` },
    { category: "Barber", title: "Hot Towel", prompt: `Context: Hot towel shave.\nWord Limit: 30-40 words\nInstructions: Relax. Mention "old school".` },
    { category: "Barber", title: "Atmosphere", prompt: `Context: Cool shop vibe.\nWord Limit: 25-35 words\nInstructions: Place. Mention "great talk".` },
    { category: "Barber", title: "Price", prompt: `Context: Good price for cut.\nWord Limit: 20-30 words\nInstructions: Value. Mention "fair".` },
    { category: "Barber", title: "Kids", prompt: `Context: Son's first haircut.\nWord Limit: 30-40 words\nInstructions: Patience. Mention "cool with kids".` },
    { category: "Barber", title: "Line Up", prompt: `Context: Crisp hairline.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "fresh".` },
    { category: "Barber", title: "Walk-in", prompt: `Context: Walked in no appointment.\nWord Limit: 25-35 words\nInstructions: Service. Mention "little wait".` },
    { category: "Barber", title: "Consistency", prompt: `Context: Always a good cut.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "my go-to".` },
    { category: "Barber", title: "Products", prompt: `Context: Pomade recommendation.\nWord Limit: 20-30 words\nInstructions: Style. Mention "great hold".` },

    // ============================================
    // 75. NAIL SALON
    // ============================================
    { category: "Nail Salon", title: "Manicure", prompt: `Context: Gel manicure.\nWord Limit: 25-35 words\nInstructions: Lasting. Mention "lasted 3 weeks".` },
    { category: "Nail Salon", title: "Pedicure", prompt: `Context: Deluxe pedicure.\nWord Limit: 30-40 words\nInstructions: Relax. Mention "massage chair".` },
    { category: "Nail Salon", title: "Dip Powder", prompt: `Context: Dip powder nails.\nWord Limit: 30-40 words\nInstructions: Strength. Mention "durable".` },
    { category: "Nail Salon", title: "Design", prompt: `Context: Nail art design.\nWord Limit: 30-40 words\nInstructions: Art. Mention "exactly like photo".` },
    { category: "Nail Salon", title: "Clean", prompt: `Context: Salon cleanliness.\nWord Limit: 25-35 words\nInstructions: Hygiene. Mention "sterilized tools".` },
    { category: "Nail Salon", title: "Acrylic", prompt: `Context: Full set acrylics.\nWord Limit: 30-40 words\nInstructions: Shape. Mention "perfect shape".` },
    { category: "Nail Salon", title: "Repair", prompt: `Context: Fixed broken nail.\nWord Limit: 20-30 words\nInstructions: Service. Mention "quick fix".` },
    { category: "Nail Salon", title: "Group", prompt: `Context: Bridal party nails.\nWord Limit: 35-45 words\nInstructions: Fun. Mention "accommodated us".` },
    { category: "Nail Salon", title: "Color", prompt: `Context: Huge color selection.\nWord Limit: 25-35 words\nInstructions: Variety. Mention "so many colors".` },
    { category: "Nail Salon", title: "Staff", prompt: `Context: Friendly staff.\nWord Limit: 25-35 words\nInstructions: People. Mention "nice".` },

    // ============================================
    // 76. SPA / MASSAGE
    // ============================================
    { category: "Spa", title: "Deep Tissue", prompt: `Context: Deep tissue massage.\nWord Limit: 30-40 words\nInstructions: Relief. Mention "knots gone".` },
    { category: "Spa", title: "Facial", prompt: `Context: Hydrating facial.\nWord Limit: 30-40 words\nInstructions: Glow. Mention "glowing skin".` },
    { category: "Spa", title: "Couples", prompt: `Context: Couples massage.\nWord Limit: 25-35 words\nInstructions: Romance. Mention "relaxing date".` },
    { category: "Spa", title: "Ambiance", prompt: `Context: Calming atmosphere.\nWord Limit: 25-35 words\nInstructions: Mood. Mention "zen".` },
    { category: "Spa", title: "Staff", prompt: `Context: Professional therapist.\nWord Limit: 25-35 words\nInstructions: Skill. Mention "magic hands".` },
    { category: "Spa", title: "Clean", prompt: `Context: Very clean facility.\nWord Limit: 20-30 words\nInstructions: Hygiene. Mention "spotless".` },
    { category: "Spa", title: "Gift", prompt: `Context: Gift card for mom.\nWord Limit: 25-35 words\nInstructions: Gift. Mention "perfect gift".` },
    { category: "Spa", title: "Prenatal", prompt: `Context: Prenatal massage.\nWord Limit: 30-40 words\nInstructions: Care. Mention "relief".` },
    { category: "Spa", title: "Sauna", prompt: `Context: Infrared sauna session.\nWord Limit: 25-35 words\nInstructions: Detox. Mention "sweat".` },
    { category: "Spa", title: "Scrub", prompt: `Context: Body scrub.\nWord Limit: 25-35 words\nInstructions: Skin. Mention "baby soft".` },

    // ============================================
    // 77. MED SPA
    // ============================================
    { category: "Med Spa", title: "Botox", prompt: `Context: Botox injections.\nWord Limit: 30-40 words\nInstructions: Result. Mention "look younger".` },
    { category: "Med Spa", title: "Laser Hair", prompt: `Context: Laser hair removal.\nWord Limit: 30-40 words\nInstructions: Effect. Mention "smooth skin".` },
    { category: "Med Spa", title: "Filler", prompt: `Context: Lip filler.\nWord Limit: 25-35 words\nInstructions: Look. Mention "natural pout".` },
    { category: "Med Spa", title: "Consult", prompt: `Context: Thorough consultation.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "knowledgeable nurse".` },
    { category: "Med Spa", title: "CoolSculpting", prompt: `Context: Fat freezing treatment.\nWord Limit: 30-40 words\nInstructions: Body. Mention "slimmer".` },
    { category: "Med Spa", title: "Microneedling", prompt: `Context: Skin pen treatment.\nWord Limit: 30-40 words\nInstructions: Skin. Mention "scar fading".` },
    { category: "Med Spa", title: "Clean", prompt: `Context: Medical grade facility.\nWord Limit: 25-35 words\nInstructions: Safety. Mention "sterile".` },
    { category: "Med Spa", title: "Staff", prompt: `Context: Friendly esthetician.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "at ease".` },
    { category: "Med Spa", title: "Peel", prompt: `Context: Chemical peel.\nWord Limit: 25-35 words\nInstructions: Glow. Mention "radiant".` },
    { category: "Med Spa", title: "Membership", prompt: `Context: Monthly membership plan.\nWord Limit: 25-35 words\nInstructions: Value. Mention "cost effective".` },

    // ============================================
    // 78. TATTOO SHOP
    // ============================================
    { category: "Tattoo", title: "Custom", prompt: `Context: Custom sleeve design.\nWord Limit: 35-45 words\nInstructions: Art. Mention "incredible artist".` },
    { category: "Tattoo", title: "Line Work", prompt: `Context: Fine line tattoo.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "crisp lines".` },
    { category: "Tattoo", title: "Portrait", prompt: `Context: Portrait of dog.\nWord Limit: 30-40 words\nInstructions: Realism. Mention "photorealistic".` },
    { category: "Tattoo", title: "Clean", prompt: `Context: Very clean shop.\nWord Limit: 25-35 words\nInstructions: Hygiene. Mention "sterile".` },
    { category: "Tattoo", title: "Cover Up", prompt: `Context: Covered old tattoo.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "can't see visible old one".` },
    { category: "Tattoo", title: "Piercing", prompt: `Context: Nose piercing.\nWord Limit: 20-30 words\nInstructions: Service. Mention "quick".` },
    { category: "Tattoo", title: "Walk-in", prompt: `Context: Flash tattoo walk-in.\nWord Limit: 25-35 words\nInstructions: Fun. Mention "spontaneous".` },
    { category: "Tattoo", title: "Healing", prompt: `Context: Healed perfectly.\nWord Limit: 25-35 words\nInstructions: Care. Mention "great aftercare advice".` },
    { category: "Tattoo", title: "Atmosphere", prompt: `Context: Cool vibe.\nWord Limit: 20-30 words\nInstructions: Place. Mention "comfortable".` },
    { category: "Tattoo", title: "Artist", prompt: `Context: Artist was nice.\nWord Limit: 25-35 words\nInstructions: Person. Mention "light hand".` },

    // ============================================
    // 79. GYM
    // ============================================
    { category: "Gym", title: "Equipment", prompt: `Context: Brand new equipment.\nWord Limit: 30-40 words\nInstructions: Facility. Mention "top notch".` },
    { category: "Gym", title: "Clean", prompt: `Context: Always cleaning.\nWord Limit: 25-35 words\nInstructions: Hygiene. Mention "germ free".` },
    { category: "Gym", title: "Crowd", prompt: `Context: Never too busy.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "no waiting".` },
    { category: "Gym", title: "Classes", prompt: `Context: Group fitness classes.\nWord Limit: 30-40 words\nInstructions: Energy. Mention "fun".` },
    { category: "Gym", title: "Staff", prompt: `Context: Front desk is nice.\nWord Limit: 20-30 words\nInstructions: Service. Mention "welcoming".` },
    { category: "Gym", title: "Price", prompt: `Context: Affordable monthly rate.\nWord Limit: 25-35 words\nInstructions: Value. Mention "bang for buck".` },
    { category: "Gym", title: "24/7", prompt: `Context: Open 24 hours.\nWord Limit: 20-30 words\nInstructions: Access. Mention "convenient".` },
    { category: "Gym", title: "Atmosphere", prompt: `Context: Motivating vibe.\nWord Limit: 25-35 words\nInstructions: Feel. Mention "judgement free".` },
    { category: "Gym", title: "Sauna", prompt: `Context: Nice sauna/steam.\nWord Limit: 25-35 words\nInstructions: Relax. Mention "recovery".` },
    { category: "Gym", title: "Childcare", prompt: `Context: Kids club is great.\nWord Limit: 30-40 words\nInstructions: Parents. Mention "kids love it".` },

    // ============================================
    // 80. PERSONAL TRAINER
    // ============================================
    { category: "Trainer", title: "Results", prompt: `Context: Lost 20 lbs.\nWord Limit: 30-40 words\nInstructions: Success. Mention "changed my life".` },
    { category: "Trainer", title: "Motivation", prompt: `Context: Pushes me hard.\nWord Limit: 25-35 words\nInstructions: Energy. Mention "keeps me going".` },
    { category: "Trainer", title: "Knowledge", prompt: `Context: Knows anatomy well.\nWord Limit: 30-40 words\nInstructions: Science. Mention "safe form".` },
    { category: "Trainer", title: "Plan", prompt: `Context: Custom workout plan.\nWord Limit: 30-40 words\nInstructions: Custom. Mention "tailored to me".` },
    { category: "Trainer", title: "Nutrition", prompt: `Context: Meal plan advice.\nWord Limit: 25-35 words\nInstructions: Diet. Mention "eating better".` },
    { category: "Trainer", title: "Flexible", prompt: `Context: Accommodates my schedule.\nWord Limit: 25-35 words\nInstructions: Time. Mention "easy to book".` },
    { category: "Trainer", title: "Injury", prompt: `Context: Helped rehab injury.\nWord Limit: 35-45 words\nInstructions: Rehab. Mention "pain free".` },
    { category: "Trainer", title: "Online", prompt: `Context: Remote coaching.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "great app".` },
    { category: "Trainer", title: "Fun", prompt: `Context: Workouts are fun.\nWord Limit: 25-35 words\nInstructions: Enjoyment. Mention "look forward to it".` },
    { category: "Trainer", title: "Value", prompt: `Context: Worth the investment.\nWord Limit: 25-35 words\nInstructions: ROI. Mention "health is wealth".` },

    // ============================================
    // 81. YOGA/PILATES
    // ============================================
    { category: "Yoga", title: "Instructor", prompt: `Context: Teacher is calming.\nWord Limit: 25-35 words\nInstructions: Vibe. Mention "amazing voice".` },
    { category: "Yoga", title: "Studio", prompt: `Context: Beautiful studio space.\nWord Limit: 30-40 words\nInstructions: Place. Mention "peaceful sanctuary".` },
    { category: "Yoga", title: "Beginner", prompt: `Context: First time class.\nWord Limit: 30-40 words\nInstructions: Entry. Mention "welcoming to newbs".` },
    { category: "Yoga", title: "Hot Yoga", prompt: `Context: Bikram class.\nWord Limit: 25-35 words\nInstructions: Sweat. Mention "great detox".` },
    { category: "Yoga", title: "Pilates Reformer", prompt: `Context: Reformer machine class.\nWord Limit: 30-40 words\nInstructions: Workout. Mention "killer core".` },
    { category: "Yoga", title: "Community", prompt: `Context: Made friends here.\nWord Limit: 25-35 words\nInstructions: Social. Mention "nice community".` },
    { category: "Yoga", title: "Schedule", prompt: `Context: Lots of class times.\nWord Limit: 20-30 words\nInstructions: Convenience. Mention "fits schedule".` },
    { category: "Yoga", title: "Clean", prompt: `Context: Clean mats/props.\nWord Limit: 20-30 words\nInstructions: Hygiene. Mention "fresh".` },
    { category: "Yoga", title: "Workshops", prompt: `Context: Weekend workshop.\nWord Limit: 30-40 words\nInstructions: Education. Mention "deepened practice".` },
    { category: "Yoga", title: "Price", prompt: `Context: Drop-in rate.\nWord Limit: 25-35 words\nInstructions: Value. Mention "affordable".` },

    // ============================================
    // 82. MARTIAL ARTS
    // ============================================
    { category: "Martial Arts", title: "Kids Class", prompt: `Context: Child learning discipline.\nWord Limit: 35-45 words\nInstructions: Growth. Mention "focus and respect".` },
    { category: "Martial Arts", title: "Instructor", prompt: `Context: Sensei is patient.\nWord Limit: 30-40 words\nInstructions: Teacher. Mention "great role model".` },
    { category: "Martial Arts", title: "Self Defense", prompt: `Context: Learning to protect self.\nWord Limit: 30-40 words\nInstructions: Confidence. Mention "empowered".` },
    { category: "Martial Arts", title: "Fitness", prompt: `Context: Great workout.\nWord Limit: 25-35 words\nInstructions: Sweat. Mention "in best shape".` },
    { category: "Martial Arts", title: "Community", prompt: `Context: Family atmosphere.\nWord Limit: 25-35 words\nInstructions: Social. Mention "welcoming".` },
    { category: "Martial Arts", title: "BJJ", prompt: `Context: Jiu Jitsu training.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "technical instruction".` },
    { category: "Martial Arts", title: "Clean", prompt: `Context: Mats are clean.\nWord Limit: 20-30 words\nInstructions: Hygiene. Mention "safe".` },
    { category: "Martial Arts", title: "Fun", prompt: `Context: Kickboxing class.\nWord Limit: 25-35 words\nInstructions: Enjoyment. Mention "stress relief".` },
    { category: "Martial Arts", title: "Competition", prompt: `Context: Tournament prep.\nWord Limit: 30-40 words\nInstructions: Sport. Mention "great coaching".` },
    { category: "Martial Arts", title: "Value", prompt: `Context: Monthly tuition.\nWord Limit: 25-35 words\nInstructions: Cost. Mention "fair".` },

    // ============================================
    // 83. DANCE STUDIO
    // ============================================
    { category: "Dance", title: "Kids Ballet", prompt: `Context: Daughter loves ballet.\nWord Limit: 30-40 words\nInstructions: Joy. Mention "looks forward to it".` },
    { category: "Dance", title: "Recital", prompt: `Context: End of year show.\nWord Limit: 35-45 words\nInstructions: Event. Mention "professional production".` },
    { category: "Dance", title: "Adult Class", prompt: `Context: Adult hip hop.\nWord Limit: 25-35 words\nInstructions: Fun. Mention "no judgement".` },
    { category: "Dance", title: "Teacher", prompt: `Context: Talented instructor.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "inspiring".` },
    { category: "Dance", title: "Wedding", prompt: `Context: First dance lessons.\nWord Limit: 30-40 words\nInstructions: Couple. Mention "made us look good".` },
    { category: "Dance", title: "Facility", prompt: `Context: Nice floors/mirrors.\nWord Limit: 25-35 words\nInstructions: Studio. Mention "spacious".` },
    { category: "Dance", title: "Competition", prompt: `Context: Competition team.\nWord Limit: 35-45 words\nInstructions: Team. Mention "winning culture".` },
    { category: "Dance", title: "Costumes", prompt: `Context: Beautiful costumes.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "sparkly".` },
    { category: "Dance", title: "Organization", prompt: `Context: Well communicating office.\nWord Limit: 30-40 words\nInstructions: Admin. Mention "organized".` },
    { category: "Dance", title: "Confidence", prompt: `Context: Built child's confidence.\nWord Limit: 30-40 words\nInstructions: Growth. Mention "shining star".` },

    // ============================================
    // 84. MUSIC LESSONS
    // ============================================
    { category: "Music Lessons", title: "Piano", prompt: `Context: Son learning piano.\nWord Limit: 30-40 words\nInstructions: Progress. Mention "playing songs quickly".` },
    { category: "Music Lessons", title: "Guitar", prompt: `Context: Guitar lessons.\nWord Limit: 30-40 words\nInstructions: Teacher. Mention "cool teacher".` },
    { category: "Music Lessons", title: "Voice", prompt: `Context: Singing lessons.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "improved range".` },
    { category: "Music Lessons", title: "Drum", prompt: `Context: Drum lessons.\nWord Limit: 25-35 words\nInstructions: Fun. Mention "loud fun".` },
    { category: "Music Lessons", title: "Online", prompt: `Context: Zoom lessons.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "works surprisingly well".` },
    { category: "Music Lessons", title: "Recital", prompt: `Context: Student concert.\nWord Limit: 30-40 words\nInstructions: Performance. Mention "proud parent".` },
    { category: "Music Lessons", title: "Theory", prompt: `Context: Learning music theory.\nWord Limit: 25-35 words\nInstructions: Education. Mention "solid foundation".` },
    { category: "Music Lessons", title: "Adult", prompt: `Context: Adult learner.\nWord Limit: 30-40 words\nInstructions: Hobby. Mention "never too late".` },
    { category: "Music Lessons", title: "Location", prompt: `Context: Convenient location.\nWord Limit: 20-30 words\nInstructions: Place. Mention "easy parking".` },
    { category: "Music Lessons", title: "Price", prompt: `Context: Affordable lessons.\nWord Limit: 20-30 words\nInstructions: Value. Mention "fair".` },

    // ============================================
    // 85. TUTORING
    // ============================================
    { category: "Tutoring", title: "Math", prompt: `Context: Helped with Algebra.\nWord Limit: 30-40 words\nInstructions: Improvement. Mention "grades went up".` },
    { category: "Tutoring", title: "Reading", prompt: `Context: Reading comprehension.\nWord Limit: 35-45 words\nInstructions: Confidence. Mention "loves reading now".` },
    { category: "Tutoring", title: "SAT/ACT", prompt: `Context: Test prep.\nWord Limit: 30-40 words\nInstructions: Score. Mention "score improved".` },
    { category: "Tutoring", title: "Tutor", prompt: `Context: Patient tutor.\nWord Limit: 30-40 words\nInstructions: Person. Mention "connected with my kid".` },
    { category: "Tutoring", title: "Center", prompt: `Context: Learning center environment.\nWord Limit: 30-40 words\nInstructions: Place. Mention "focused".` },
    { category: "Tutoring", title: "Chemistry", prompt: `Context: High school chemistry.\nWord Limit: 30-40 words\nInstructions: Subject. Mention "made it understandable".` },
    { category: "Tutoring", title: "Flexible", prompt: `Context: Works with schedule.\nWord Limit: 25-35 words\nInstructions: Time. Mention "accommodating".` },
    { category: "Tutoring", title: "Online", prompt: `Context: Virtual tutoring.\nWord Limit: 25-35 words\nInstructions: Convenience. Mention "easy".` },
    { category: "Tutoring", title: "Special Needs", prompt: `Context: ADHD support.\nWord Limit: 40-50 words\nInstructions: Care. Mention "great strategies".` },
    { category: "Tutoring", title: "Price", prompt: `Context: Worth the cost.\nWord Limit: 25-35 words\nInstructions: ROI. Mention "investment in future".` },

    // ============================================
    // 86. DAYCARE
    // ============================================
    { category: "Daycare", title: "Care", prompt: `Context: They love my child.\nWord Limit: 30-40 words\nInstructions: Love. Mention "second family".` },
    { category: "Daycare", title: "Learning", prompt: `Context: Pre-K curriculum.\nWord Limit: 35-45 words\nInstructions: Education. Mention "ready for kindergarten".` },
    { category: "Daycare", title: "Clean", prompt: `Context: Facility is clean.\nWord Limit: 25-35 words\nInstructions: Hygiene. Mention "safe environment".` },
    { category: "Daycare", title: "Communication", prompt: `Context: Daily app updates/photos.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "love the photos".` },
    { category: "Daycare", title: "Staff", prompt: `Context: Tenured teachers.\nWord Limit: 30-40 words\nInstructions: Stability. Mention "low turnover".` },
    { category: "Daycare", title: "Food", prompt: `Context: Healthy meals provided.\nWord Limit: 25-35 words\nInstructions: Diet. Mention "nutritious".` },
    { category: "Daycare", title: "Playground", prompt: `Context: Nice outdoor area.\nWord Limit: 25-35 words\nInstructions: Fun. Mention "running around".` },
    { category: "Daycare", title: "Infant", prompt: `Context: Infant room care.\nWord Limit: 35-45 words\nInstructions: Trust. Mention "peace of mind".` },
    { category: "Daycare", title: "Safety", prompt: `Context: Secure entry.\nWord Limit: 25-35 words\nInstructions: Security. Mention "safe".` },
    { category: "Daycare", title: "Community", prompt: `Context: Parent events.\nWord Limit: 25-35 words\nInstructions: Social. Mention "community feel".` },

    // ============================================
    // 87. PET GROOMING
    // ============================================
    { category: "Grooming", title: "Haircut", prompt: `Context: Goldendoodle cut.\nWord Limit: 30-40 words\nInstructions: Look. Mention "teddy bear cut".` },
    { category: "Grooming", title: "Bath", prompt: `Context: Bath and brush.\nWord Limit: 25-35 words\nInstructions: Scent. Mention "smells amazing".` },
    { category: "Grooming", title: "Nails", prompt: `Context: Nail trim.\nWord Limit: 20-30 words\nInstructions: Care. Mention "quick and easy".` },
    { category: "Grooming", title: "Shedding", prompt: `Context: De-shedding treatment.\nWord Limit: 30-40 words\nInstructions: Hair. Mention "less hair at home".` },
    { category: "Grooming", title: "Staff", prompt: `Context: Loves animals.\nWord Limit: 30-40 words\nInstructions: Love. Mention "dog was happy".` },
    { category: "Grooming", title: "Cat", prompt: `Context: Cat grooming.\nWord Limit: 30-40 words\nInstructions: Difficult. Mention "handled well".` },
    { category: "Grooming", title: "Mobile", prompt: `Context: Mobile van came to house.\nWord Limit: 30-40 words\nInstructions: Convenience. Mention "stress free".` },
    { category: "Grooming", title: "Price", prompt: `Context: Reasonable price.\nWord Limit: 25-35 words\nInstructions: Value. Mention "fair".` },
    { category: "Grooming", title: "Availability", prompt: `Context: Got appointment fast.\nWord Limit: 25-35 words\nInstructions: Speed. Mention "no wait".` },
    { category: "Grooming", title: "Bows", prompt: `Context: Cute bandana/bows.\nWord Limit: 20-30 words\nInstructions: Detail. Mention "adorable".` },

    // ============================================
    // 88. DOG WALKING
    // ============================================
    { category: "Dog Walking", title: "Daily", prompt: `Context: Mid-day walk.\nWord Limit: 30-40 words\nInstructions: Reliability. Mention "break up the day".` },
    { category: "Dog Walking", title: "Walker", prompt: `Context: Walker loves my dog.\nWord Limit: 25-35 words\nInstructions: Bond. Mention "dog loves her".` },
    { category: "Dog Walking", title: "App", prompt: `Context: GPS tracking/Report.\nWord Limit: 30-40 words\nInstructions: Tech. Mention "report card".` },
    { category: "Dog Walking", title: "Vacation", prompt: `Context: Pet sitting while away.\nWord Limit: 35-45 words\nInstructions: Trust. Mention "daily updates".` },
    { category: "Dog Walking", title: "Puppy", prompt: `Context: Puppy potty breaks.\nWord Limit: 30-40 words\nInstructions: Help. Mention "lifesaver".` },
    { category: "Dog Walking", title: "Group", prompt: `Context: Group hike.\nWord Limit: 25-35 words\nInstructions: Social. Mention "socialization".` },
    { category: "Dog Walking", title: "Overnight", prompt: `Context: Stayed at my house.\nWord Limit: 30-40 words\nInstructions: Care. Mention "house was clean".` },
    { category: "Dog Walking", title: "Flexibility", prompt: `Context: Last minute request.\nWord Limit: 25-35 words\nInstructions: Service. Mention "accommodating".` },
    { category: "Dog Walking", title: "Cat", prompt: `Context: Checked on cat.\nWord Limit: 25-35 words\nInstructions: Care. Mention "happy kitty".` },
    { category: "Dog Walking", title: "Price", prompt: `Context: Affordable rates.\nWord Limit: 20-30 words\nInstructions: Value. Mention "great value".` },

    // ============================================
    // 89. VETERINARIAN
    // ============================================
    { category: "Vet", title: "Checkup", prompt: `Context: Annual exam.\nWord Limit: 30-40 words\nInstructions: Care. Mention "thorough".` },
    { category: "Vet", title: "Staff", prompt: `Context: Friendly techs.\nWord Limit: 25-35 words\nInstructions: People. Mention "love pets".` },
    { category: "Vet", title: "Sick Visit", prompt: `Context: Dog was vomiting.\nWord Limit: 30-40 words\nInstructions: Diagnosis. Mention "feeling better".` },
    { category: "Vet", title: "Surgery", prompt: `Context: Spay/Neuter surgery.\nWord Limit: 35-45 words\nInstructions: Procedure. Mention "quick recovery".` },
    { category: "Vet", title: "Dental", prompt: `Context: Teeth cleaning.\nWord Limit: 25-35 words\nInstructions: Health. Mention "fresh breath".` },
    { category: "Vet", title: "Emergency", prompt: `Context: Squeezed us in.\nWord Limit: 30-40 words\nInstructions: Urgency. Mention "saved the day".` },
    { category: "Vet", title: "Price", prompt: `Context: Affordable care.\nWord Limit: 25-35 words\nInstructions: Value. Mention "didn't overcharge".` },
    { category: "Vet", title: "End of Life", prompt: `Context: Put dog to sleep.\nWord Limit: 40-50 words\nInstructions: Compassion. Mention "peaceful" and "supportive".` },
    { category: "Vet", title: "Clean", prompt: `Context: Clean clinic.\nWord Limit: 20-30 words\nInstructions: Hygiene. Mention "smells good".` },
    { category: "Vet", title: "Advice", prompt: `Context: Great nutrition advice.\nWord Limit: 30-40 words\nInstructions: Education. Mention "knowledgeable".` },

    // ============================================
    // 90. TAILOR
    // ============================================
    { category: "Tailor", title: "Hemming", prompt: `Context: Hemmed jeans.\nWord Limit: 25-35 words\nInstructions: Fit. Mention "perfect length".` },
    { category: "Tailor", title: "Suit", prompt: `Context: Altered suit jacket.\nWord Limit: 30-40 words\nInstructions: Style. Mention "custom fit".` },
    { category: "Tailor", title: "Wedding Dress", prompt: `Context: Bridal alterations.\nWord Limit: 35-45 words\nInstructions: Event. Mention "bustle looked great".` },
    { category: "Tailor", title: "Zipper", prompt: `Context: Replaced zipper.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "works smooth".` },
    { category: "Tailor", title: "Resizing", prompt: `Context: Took in dress.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "fits like glove".` },
    { category: "Tailor", title: "Speed", prompt: `Context: Rush order.\nWord Limit: 25-35 words\nInstructions: Time. Mention "ready next day".` },
    { category: "Tailor", title: "Leather", prompt: `Context: Leather jacket repair.\nWord Limit: 30-40 words\nInstructions: Specialty. Mention "seamless".` },
    { category: "Tailor", title: "Price", prompt: `Context: Reasonable price.\nWord Limit: 20-30 words\nInstructions: Value. Mention "fair".` },
    { category: "Tailor", title: "Curtains", prompt: `Context: Hemmed drapes.\nWord Limit: 25-35 words\nInstructions: Home. Mention "even hem".` },
    { category: "Tailor", title: "Service", prompt: `Context: Friendly tailor.\nWord Limit: 25-35 words\nInstructions: People. Mention "nice".` },

    // ============================================
    // 91. SHOE REPAIR
    // ============================================
    { category: "Shoe Repair", title: "Heels", prompt: `Context: Replaced heel tips.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "sturdy".` },
    { category: "Shoe Repair", title: "Soles", prompt: `Context: Resoled boots.\nWord Limit: 30-40 words\nInstructions: Value. Mention "better than new".` },
    { category: "Shoe Repair", title: "Shine", prompt: `Context: Polish and shine.\nWord Limit: 20-30 words\nInstructions: Look. Mention "brand new".` },
    { category: "Shoe Repair", title: "Stretch", prompt: `Context: Stretched tight shoes.\nWord Limit: 25-35 words\nInstructions: Comfort. Mention "fit perfectly".` },
    { category: "Shoe Repair", title: "Zipper", prompt: `Context: Boot zipper fix.\nWord Limit: 25-35 words\nInstructions: Fix. Mention "strong".` },
    { category: "Shoe Repair", title: "Bag Repair", prompt: `Context: Fixed purse strap.\nWord Limit: 30-40 words\nInstructions: Accessory. Mention "quality stitch".` },
    { category: "Shoe Repair", title: "Orthopedic", prompt: `Context: Added lift.\nWord Limit: 30-40 words\nInstructions: Health. Mention "comfortable".` },
    { category: "Shoe Repair", title: "Dye", prompt: `Context: Dyed satin shoes.\nWord Limit: 25-35 words\nInstructions: Color. Mention "perfect match".` },
    { category: "Shoe Repair", title: "Speed", prompt: `Context: While I wait.\nWord Limit: 20-30 words\nInstructions: Convenience. Mention "fast".` },
    { category: "Shoe Repair", title: "Craftsmanship", prompt: `Context: Old school cobbler.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "master".` },

    // ============================================
    // 92. DRY CLEANING
    // ============================================
    { category: "Dry Cleaning", title: "Suits", prompt: `Context: Cleaned work suits.\nWord Limit: 25-35 words\nInstructions: Clean. Mention "crisp".` },
    { category: "Dry Cleaning", title: "Stain", prompt: `Context: Removed wine stain.\nWord Limit: 30-40 words\nInstructions: Miracle. Mention "saved the dress".` },
    { category: "Dry Cleaning", title: "Comforter", prompt: `Context: Huge down comforter.\nWord Limit: 30-40 words\nInstructions: Bedding. Mention "fluffy".` },
    { category: "Dry Cleaning", title: "Shirts", prompt: `Context: Laundered shirts.\nWord Limit: 25-35 words\nInstructions: Press. Mention "perfect starch".` },
    { category: "Dry Cleaning", title: "Wedding Dress", prompt: `Context: Preserved wedding gown.\nWord Limit: 35-45 words\nInstructions: Memory. Mention "boxed beautifully".` },
    { category: "Dry Cleaning", title: "Delivery", prompt: `Context: Pickup and delivery.\nWord Limit: 30-40 words\nInstructions: Convenience. Mention "time saver".` },
    { category: "Dry Cleaning", title: "Speed", prompt: `Context: Same day service.\nWord Limit: 25-35 words\nInstructions: Time. Mention "fast".` },
    { category: "Dry Cleaning", title: "Eco", prompt: `Context: Organic cleaning.\nWord Limit: 30-40 words\nInstructions: Health. Mention "no chemical smell".` },
    { category: "Dry Cleaning", title: "Friendly", prompt: `Context: Nice owner.\nWord Limit: 20-30 words\nInstructions: Service. Mention "greets by name".` },
    { category: "Dry Cleaning", title: "Buttons", prompt: `Context: Replaced missing buttons.\nWord Limit: 25-35 words\nInstructions: Detail. Mention "extra touch".` },

    // ============================================
    // 93. WATCH REPAIR
    // ============================================
    { category: "Watch Repair", title: "Battery", prompt: `Context: Replaced battery.\nWord Limit: 20-30 words\nInstructions: Speed. Mention "quick".` },
    { category: "Watch Repair", title: "Link Removal", prompt: `Context: Sized watch band.\nWord Limit: 25-35 words\nInstructions: Fit. Mention "fits wrist".` },
    { category: "Watch Repair", title: "Overhaul", prompt: `Context: Serviced luxury watch.\nWord Limit: 35-45 words\nInstructions: Skill. Mention "running perfect".` },
    { category: "Watch Repair", title: "Crystal", prompt: `Context: Replaced scratches glass.\nWord Limit: 30-40 words\nInstructions: Look. Mention "crystal clear".` },
    { category: "Watch Repair", title: "Vintage", prompt: `Context: Restored grandpa's watch.\nWord Limit: 40-50 words\nInstructions: Emotion. Mention "looks new".` },
    { category: "Watch Repair", title: "Band", prompt: `Context: New leather strap.\nWord Limit: 25-35 words\nInstructions: Style. Mention "great selection".` },
    { category: "Watch Repair", title: "Waterproof", prompt: `Context: Pressure test.\nWord Limit: 25-35 words\nInstructions: Function. Mention "sealed".` },
    { category: "Watch Repair", title: "Price", prompt: `Context: Fair price.\nWord Limit: 20-30 words\nInstructions: Value. Mention "affordable".` },
    { category: "Watch Repair", title: "Honesty", prompt: `Context: Honest diagnosis.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "didn't upsiell".` },
    { category: "Watch Repair", title: "Fast", prompt: `Context: While I shopped.\nWord Limit: 20-30 words\nInstructions: Service. Mention "efficient".` },

    // ============================================
    // 94. JEWELRY REPAIR
    // ============================================
    { category: "Jewelry Repair", title: "Ring Sizing", prompt: `Context: Resized ring smaller.\nWord Limit: 30-40 words\nInstructions: Skill. Mention "invisible seam".` },
    { category: "Jewelry Repair", title: "Chain Fix", prompt: `Context: Soldered broken chain.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "strong".` },
    { category: "Jewelry Repair", title: "Prong", prompt: `Context: Retipped diamond prong.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "secure stone".` },
    { category: "Jewelry Repair", title: "Cleaning", prompt: `Context: Deep cleaning.\nWord Limit: 30-40 words\nInstructions: Shine. Mention "sparkles like new".` },
    { category: "Jewelry Repair", title: "Custom", prompt: `Context: Custom design.\nWord Limit: 40-50 words\nInstructions: Art. Mention "one of a kind".` },
    { category: "Jewelry Repair", title: "Watch Batt", prompt: `Context: Watch battery change.\nWord Limit: 20-30 words\nInstructions: Convenience. Mention "fast".` },
    { category: "Jewelry Repair", title: "Engraving", prompt: `Context: Engraved date.\nWord Limit: 25-35 words\nInstructions: Sentiment. Mention "beautiful script".` },
    { category: "Jewelry Repair", title: "Appraisal", prompt: `Context: Insurance appraisal.\nWord Limit: 30-40 words\nInstructions: Professional. Mention "detailed".` },
    { category: "Jewelry Repair", title: "Pearl", prompt: `Context: Restrung pearls.\nWord Limit: 30-40 words\nInstructions: Care. Mention "knotted perfectly".` },
    { category: "Jewelry Repair", title: "Stone Replace", prompt: `Context: Replaced lost stone.\nWord Limit: 30-40 words\nInstructions: Match. Mention "perfect match".` },

    // ============================================
    // 95. PHONE REPAIR
    // ============================================
    { category: "Phone Repair", title: "Screen", prompt: `Context: iPhone screen replacement.\nWord Limit: 25-35 words\nInstructions: Repair. Mention "looks brand new".` },
    { category: "Phone Repair", title: "Battery", prompt: `Context: New battery install.\nWord Limit: 25-35 words\nInstructions: Power. Mention "holds charge".` },
    { category: "Phone Repair", title: "Water Damage", prompt: `Context: Dropped in pool.\nWord Limit: 35-45 words\nInstructions: Save. Mention "saved my photos".` },
    { category: "Phone Repair", title: "Charging Port", prompt: `Context: Clean/Fix port.\nWord Limit: 30-40 words\nInstructions: Fix. Mention "charges fast".` },
    { category: "Phone Repair", title: "Camera", prompt: `Context: Replaced camera lens.\nWord Limit: 25-35 words\nInstructions: Photo. Mention "clear photos".` },
    { category: "Phone Repair", title: "Speed", prompt: `Context: Done in 30 mins.\nWord Limit: 25-35 words\nInstructions: Time. Mention "super fast".` },
    { category: "Phone Repair", title: "Price", prompt: `Context: Cheaper than Apple.\nWord Limit: 25-35 words\nInstructions: Value. Mention "saved money".` },
    { category: "Phone Repair", title: "Tablet", prompt: `Context: iPad screen fix.\nWord Limit: 30-40 words\nInstructions: Device. Mention "kids happy".` },
    { category: "Phone Repair", title: "Case", prompt: `Context: Bought screen protector.\nWord Limit: 20-30 words\nInstructions: Accessory. Mention "installed perfectly".` },
    { category: "Phone Repair", title: "Warranty", prompt: `Context: Warranty on repair.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "guaranteed".` },

    // ============================================
    // 96. APPLIANCE STORE
    // ============================================
    { category: "Appliance Store", title: "Sales", prompt: `Context: Bought new fridge.\nWord Limit: 30-40 words\nInstructions: Experience. Mention "knowledgeable sales".` },
    { category: "Appliance Store", title: "Delivery", prompt: `Context: Delivered and installed.\nWord Limit: 35-45 words\nInstructions: Service. Mention "careful with floors".` },
    { category: "Appliance Store", title: "Selection", prompt: `Context: Great showroom.\nWord Limit: 30-40 words\nInstructions: Variety. Mention "lots of options".` },
    { category: "Appliance Store", title: "Price", prompt: `Context: Price match.\nWord Limit: 25-35 words\nInstructions: Value. Mention "matched competitor".` },
    { category: "Appliance Store", title: "Package", prompt: `Context: Kitchen package.\nWord Limit: 35-45 words\nInstructions: Bundle. Mention "great discount".` },
    { category: "Appliance Store", title: "Parts", prompt: `Context: Bought replacement part.\nWord Limit: 25-35 words\nInstructions: DIY. Mention "in stock".` },
    { category: "Appliance Store", title: "Scratch/Dent", prompt: `Context: Outlet deal.\nWord Limit: 30-40 words\nInstructions: Savings. Mention "huge savings".` },
    { category: "Appliance Store", title: "Dishwasher", prompt: `Context: Quiet dishwasher advice.\nWord Limit: 30-40 words\nInstructions: Help. Mention "so quiet".` },
    { category: "Appliance Store", title: "Warranty", prompt: `Context: Extended warranty.\nWord Limit: 25-35 words\nInstructions: Peace. Mention "covered".` },
    { category: "Appliance Store", title: "Local", prompt: `Context: Local business.\nWord Limit: 25-35 words\nInstructions: Support. Mention "better than big box".` },

    // ============================================
    // 97. MATTRESS STORE
    // ============================================
    { category: "Mattress Store", title: "Comfort", prompt: `Context: Found perfect bed.\nWord Limit: 30-40 words\nInstructions: Sleep. Mention "best sleep ever".` },
    { category: "Mattress Store", title: "Salesperson", prompt: `Context: Not pushy.\nWord Limit: 30-40 words\nInstructions: Service. Mention "patient".` },
    { category: "Mattress Store", title: "Delivery", prompt: `Context: Delivered and haul away.\nWord Limit: 35-45 words\nInstructions: Service. Mention "took old mattress".` },
    { category: "Mattress Store", title: "Price", prompt: `Context: Sale price.\nWord Limit: 25-35 words\nInstructions: Value. Mention "fair deal".` },
    { category: "Mattress Store", title: "Selection", prompt: `Context: Lots of brands.\nWord Limit: 25-35 words\nInstructions: Variety. Mention "tested many".` },
    { category: "Mattress Store", title: "Warranty", prompt: `Context: Comfort guarantee.\nWord Limit: 30-40 words\nInstructions: Trust. Mention "risk free".` },
    { category: "Mattress Store", title: "Pillows", prompt: `Context: Bought pillows too.\nWord Limit: 25-35 words\nInstructions: Accessory. Mention "comfy".` },
    { category: "Mattress Store", title: "Adjustable", prompt: `Context: Adjustable base.\nWord Limit: 30-40 words\nInstructions: Feature. Mention "zero gravity".` },
    { category: "Mattress Store", title: "Clean", prompt: `Context: Clean showroom.\nWord Limit: 20-30 words\nInstructions: Hygiene. Mention "clean".` },
    { category: "Mattress Store", title: "Education", prompt: `Context: Explained coil count.\nWord Limit: 30-40 words\nInstructions: Info. Mention "learned a lot".` },

    // ============================================
    // 98. FURNITURE STORE
    // ============================================
    { category: "Furniture", title: "Sofa", prompt: `Context: Bought sectional.\nWord Limit: 30-40 words\nInstructions: Comfort. Mention "fits family".` },
    { category: "Furniture", title: "Quality", prompt: `Context: Solid wood table.\nWord Limit: 30-40 words\nInstructions: Material. Mention "heirloom quality".` },
    { category: "Furniture", title: "Delivery", prompt: `Context: White glove delivery.\nWord Limit: 35-45 words\nInstructions: Service. Mention "setup everything".` },
    { category: "Furniture", title: "Custom", prompt: `Context: Custom fabric.\nWord Limit: 30-40 words\nInstructions: Design. Mention "perfect color".` },
    { category: "Furniture", title: "Sales", prompt: `Context: Helpful staff.\nWord Limit: 30-40 words\nInstructions: Service. Mention "design help".` },
    { category: "Furniture", title: "Bedroom", prompt: `Context: Bedroom set.\nWord Limit: 30-40 words\nInstructions: Style. Mention "beautiful".` },
    { category: "Furniture", title: "Patio", prompt: `Context: Outdoor furniture.\nWord Limit: 30-40 words\nInstructions: Durable. Mention "weather proof".` },
    { category: "Furniture", title: "Financing", prompt: `Context: 0% interest.\nWord Limit: 25-35 words\nInstructions: Value. Mention "easy payments".` },
    { category: "Furniture", title: "Rug", prompt: `Context: Bought area rug.\nWord Limit: 25-35 words\nInstructions: Decor. Mention "soft".` },
    { category: "Furniture", title: "Experience", prompt: `Context: Creating home.\nWord Limit: 30-40 words\nInstructions: Feel. Mention "happy".` },

    // ============================================
    // 99. NURSERY / GARDEN
    // ============================================
    { category: "Nursery", title: "Plants", prompt: `Context: Bought healthy trees.\nWord Limit: 30-40 words\nInstructions: Quality. Mention "thriving".` },
    { category: "Nursery", title: "Staff", prompt: `Context: Expert advice.\nWord Limit: 35-45 words\nInstructions: Knowledge. Mention "answered all questions".` },
    { category: "Nursery", title: "Selection", prompt: `Context: Native plants.\nWord Limit: 30-40 words\nInstructions: Variety. Mention "great selection".` },
    { category: "Nursery", title: "Warranty", prompt: `Context: Plant warranty.\nWord Limit: 25-35 words\nInstructions: Trust. Mention "guarantee".` },
    { category: "Nursery", title: "Delivery", prompt: `Context: Delivery and planting.\nWord Limit: 30-40 words\nInstructions: Service. Mention "heavy lifting".` },
    { category: "Nursery", title: "Mulch", prompt: `Context: Bulk mulch.\nWord Limit: 25-35 words\nInstructions: Value. Mention "good price".` },
    { category: "Nursery", title: "Flowers", prompt: `Context: Hanging baskets.\nWord Limit: 25-35 words\nInstructions: Beauty. Mention "colorful".` },
    { category: "Nursery", title: "Vibe", prompt: `Context: Walking the grounds.\nWord Limit: 25-35 words\nInstructions: Experience. Mention "peaceful".` },
    { category: "Nursery", title: "Tools", prompt: `Context: Quality tools.\nWord Limit: 20-30 words\nInstructions: Product. Mention "durable".` },
    { category: "Nursery", title: "Local", prompt: `Context: Local grower.\nWord Limit: 25-35 words\nInstructions: Support. Mention "acclimated to zone".` },

    // ============================================
    // 100. TRAVEL AGENCY
    // ============================================
    { category: "Travel Agency", title: "Honeymoon", prompt: `Context: Planned honeymoon.\nWord Limit: 35-45 words\nInstructions: Romance. Mention "dream trip".` },
    { category: "Travel Agency", title: "Disney", prompt: `Context: Disney planner.\nWord Limit: 35-45 words\nInstructions: Family. Mention "magical and organized".` },
    { category: "Travel Agency", title: "Cruise", prompt: `Context: Cruise booking.\nWord Limit: 30-40 words\nInstructions: Ease. Mention "cabin selection".` },
    { category: "Travel Agency", title: "Group", prompt: `Context: Family reunion.\nWord Limit: 35-45 words\nInstructions: Coordination. Mention "handled everyone".` },
    { category: "Travel Agency", title: "Price", prompt: `Context: Found best deal.\nWord Limit: 30-40 words\nInstructions: Value. Mention "saved money".` },
    { category: "Travel Agency", title: "Support", prompt: `Context: Help during trip.\nWord Limit: 30-40 words\nInstructions: Safety. Mention "peace of mind".` },
    { category: "Travel Agency", title: "International", prompt: `Context: Europe trip.\nWord Limit: 35-45 words\nInstructions: Logistics. Mention "hotels were great".` },
    { category: "Travel Agency", title: "Itinerary", prompt: `Context: Detailed itinerary.\nWord Limit: 30-40 words\nInstructions: Plan. Mention "great suggestions".` },
    { category: "Travel Agency", title: "Flights", prompt: `Context: Rebooked cancelled flight.\nWord Limit: 30-40 words\nInstructions: Problem solve. Mention "lifesaver".` },
    { category: "Travel Agency", title: "luxury", prompt: `Context: Luxury resort.\nWord Limit: 30-40 words\nInstructions: Exp. Mention "VIP treatment".` },
];

