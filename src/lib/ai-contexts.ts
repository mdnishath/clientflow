/**
 * AI Context Library - 100+ Unique Review Personas
 * 
 * Each context provides a unique "voice" for generating reviews.
 * The AI will adopt the persona and write from that perspective.
 * 
 * Categories:
 * - RESTAURANT: Food, dining, cafe, fast food
 * - SERVICE: Plumber, electrician, salon, garage
 * - RETAIL: Shop, boutique, store
 * - MEDICAL: Doctor, dentist, clinic
 * - GENERAL: Universal contexts for any business
 */

export interface ReviewContext {
    id: string;
    category: "RESTAURANT" | "SERVICE" | "RETAIL" | "MEDICAL" | "GENERAL";
    persona: string;
    scenario: string;
    tone: "enthusiastic" | "satisfied" | "professional" | "casual" | "detailed";
    focusPoints: string[];
}

// ============================================
// RESTAURANT CONTEXTS (25+)
// ============================================
const restaurantContexts: ReviewContext[] = [
    {
        id: "rest-01",
        category: "RESTAURANT",
        persona: "Busy professional grabbing lunch",
        scenario: "Quick lunch break, needed fast service",
        tone: "satisfied",
        focusPoints: ["speed", "taste", "value"],
    },
    {
        id: "rest-02",
        category: "RESTAURANT",
        persona: "Parent with young children",
        scenario: "Family dinner, kids menu important",
        tone: "enthusiastic",
        focusPoints: ["family-friendly", "portions", "atmosphere"],
    },
    {
        id: "rest-03",
        category: "RESTAURANT",
        persona: "Food enthusiast blogger",
        scenario: "Trying new cuisine, detailed analysis",
        tone: "detailed",
        focusPoints: ["presentation", "ingredients", "creativity"],
    },
    {
        id: "rest-04",
        category: "RESTAURANT",
        persona: "Tourist visiting the city",
        scenario: "First time trying local food",
        tone: "enthusiastic",
        focusPoints: ["authenticity", "location", "experience"],
    },
    {
        id: "rest-05",
        category: "RESTAURANT",
        persona: "Local regular customer",
        scenario: "Weekly visit, knows the menu well",
        tone: "casual",
        focusPoints: ["consistency", "favorites", "staff"],
    },
    {
        id: "rest-06",
        category: "RESTAURANT",
        persona: "Couple on a date night",
        scenario: "Romantic dinner, ambiance matters",
        tone: "satisfied",
        focusPoints: ["ambiance", "service", "wine selection"],
    },
    {
        id: "rest-07",
        category: "RESTAURANT",
        persona: "Group celebrating a birthday",
        scenario: "Party of 8, special occasion",
        tone: "enthusiastic",
        focusPoints: ["group handling", "dessert", "celebration"],
    },
    {
        id: "rest-08",
        category: "RESTAURANT",
        persona: "Health-conscious diner",
        scenario: "Looking for healthy options",
        tone: "professional",
        focusPoints: ["healthy options", "freshness", "customization"],
    },
    {
        id: "rest-09",
        category: "RESTAURANT",
        persona: "Senior citizen",
        scenario: "Quiet meal with spouse",
        tone: "satisfied",
        focusPoints: ["portion size", "comfort food", "parking"],
    },
    {
        id: "rest-10",
        category: "RESTAURANT",
        persona: "Business lunch host",
        scenario: "Impressing a client",
        tone: "professional",
        focusPoints: ["professionalism", "private space", "menu quality"],
    },
    {
        id: "rest-11",
        category: "RESTAURANT",
        persona: "Student on a budget",
        scenario: "Affordable meal after class",
        tone: "casual",
        focusPoints: ["price", "portions", "student deals"],
    },
    {
        id: "rest-12",
        category: "RESTAURANT",
        persona: "Delivery customer",
        scenario: "Ordered online, judging delivery",
        tone: "satisfied",
        focusPoints: ["packaging", "delivery time", "food temperature"],
    },
    {
        id: "rest-13",
        category: "RESTAURANT",
        persona: "Vegetarian/Vegan diner",
        scenario: "Checking plant-based options",
        tone: "enthusiastic",
        focusPoints: ["vegan options", "ingredient transparency", "taste"],
    },
    {
        id: "rest-14",
        category: "RESTAURANT",
        persona: "Late-night diner",
        scenario: "After-party food run",
        tone: "casual",
        focusPoints: ["late hours", "quick service", "comfort food"],
    },
    {
        id: "rest-15",
        category: "RESTAURANT",
        persona: "Coffee enthusiast",
        scenario: "Morning coffee ritual",
        tone: "detailed",
        focusPoints: ["coffee quality", "barista skill", "pastries"],
    },
    {
        id: "rest-16",
        category: "RESTAURANT",
        persona: "Breakfast lover",
        scenario: "Weekend brunch with friends",
        tone: "enthusiastic",
        focusPoints: ["eggs", "pancakes", "mimosas"],
    },
    {
        id: "rest-17",
        category: "RESTAURANT",
        persona: "Wine connoisseur",
        scenario: "Dinner with wine pairing",
        tone: "professional",
        focusPoints: ["wine list", "sommelier", "pairing"],
    },
    {
        id: "rest-18",
        category: "RESTAURANT",
        persona: "Allergy-sensitive customer",
        scenario: "Needs gluten-free options",
        tone: "satisfied",
        focusPoints: ["allergy awareness", "staff knowledge", "safe options"],
    },
    {
        id: "rest-19",
        category: "RESTAURANT",
        persona: "Takeout regular",
        scenario: "Weekly takeout order",
        tone: "casual",
        focusPoints: ["consistency", "packaging", "accuracy"],
    },
    {
        id: "rest-20",
        category: "RESTAURANT",
        persona: "First-time visitor",
        scenario: "Heard about it from a friend",
        tone: "enthusiastic",
        focusPoints: ["first impression", "recommendation", "return visit"],
    },
    {
        id: "rest-21",
        category: "RESTAURANT",
        persona: "Pizza lover",
        scenario: "Ordering pizza for game night",
        tone: "casual",
        focusPoints: ["crust", "toppings", "cheese"],
    },
    {
        id: "rest-22",
        category: "RESTAURANT",
        persona: "Sushi aficionado",
        scenario: "Omakase experience",
        tone: "detailed",
        focusPoints: ["fish freshness", "chef skill", "presentation"],
    },
    {
        id: "rest-23",
        category: "RESTAURANT",
        persona: "Burger enthusiast",
        scenario: "Trying the signature burger",
        tone: "enthusiastic",
        focusPoints: ["patty", "bun", "fries"],
    },
    {
        id: "rest-24",
        category: "RESTAURANT",
        persona: "Dessert lover",
        scenario: "Came just for dessert",
        tone: "enthusiastic",
        focusPoints: ["sweets", "presentation", "portion"],
    },
    {
        id: "rest-25",
        category: "RESTAURANT",
        persona: "Outdoor dining fan",
        scenario: "Beautiful terrace experience",
        tone: "satisfied",
        focusPoints: ["terrace", "weather", "view"],
    },
];

// ============================================
// SERVICE CONTEXTS (25+)
// ============================================
const serviceContexts: ReviewContext[] = [
    {
        id: "serv-01",
        category: "SERVICE",
        persona: "Homeowner with emergency",
        scenario: "Broken pipe, needed urgent help",
        tone: "enthusiastic",
        focusPoints: ["response time", "professionalism", "problem solved"],
    },
    {
        id: "serv-02",
        category: "SERVICE",
        persona: "First-time customer",
        scenario: "Found them online, took a chance",
        tone: "satisfied",
        focusPoints: ["trustworthiness", "price", "quality"],
    },
    {
        id: "serv-03",
        category: "SERVICE",
        persona: "Repeat customer",
        scenario: "Third time using their service",
        tone: "casual",
        focusPoints: ["consistency", "loyalty", "familiarity"],
    },
    {
        id: "serv-04",
        category: "SERVICE",
        persona: "Busy professional",
        scenario: "Needed appointment outside work hours",
        tone: "professional",
        focusPoints: ["flexibility", "punctuality", "efficiency"],
    },
    {
        id: "serv-05",
        category: "SERVICE",
        persona: "Elderly person",
        scenario: "Needed patient explanation",
        tone: "satisfied",
        focusPoints: ["patience", "clear communication", "respectful"],
    },
    {
        id: "serv-06",
        category: "SERVICE",
        persona: "Parent at home",
        scenario: "Service done while kids were around",
        tone: "enthusiastic",
        focusPoints: ["cleanliness", "safety", "kid-friendly"],
    },
    {
        id: "serv-07",
        category: "SERVICE",
        persona: "Landlord managing property",
        scenario: "Needed reliable contractor",
        tone: "professional",
        focusPoints: ["reliability", "pricing", "documentation"],
    },
    {
        id: "serv-08",
        category: "SERVICE",
        persona: "New homeowner",
        scenario: "First time dealing with this issue",
        tone: "detailed",
        focusPoints: ["education", "guidance", "fair pricing"],
    },
    {
        id: "serv-09",
        category: "SERVICE",
        persona: "Car owner",
        scenario: "Regular maintenance visit",
        tone: "satisfied",
        focusPoints: ["transparency", "no upselling", "quality parts"],
    },
    {
        id: "serv-10",
        category: "SERVICE",
        persona: "Salon client",
        scenario: "New haircut or color",
        tone: "enthusiastic",
        focusPoints: ["consultation", "skill", "style knowledge"],
    },
    {
        id: "serv-11",
        category: "SERVICE",
        persona: "Spa visitor",
        scenario: "Relaxation and self-care",
        tone: "satisfied",
        focusPoints: ["ambiance", "technique", "relaxation"],
    },
    {
        id: "serv-12",
        category: "SERVICE",
        persona: "Moving customer",
        scenario: "Relocating to new home",
        tone: "enthusiastic",
        focusPoints: ["careful handling", "time management", "team attitude"],
    },
    {
        id: "serv-13",
        category: "SERVICE",
        persona: "Pet owner",
        scenario: "Grooming or vet visit",
        tone: "detailed",
        focusPoints: ["animal handling", "gentleness", "expertise"],
    },
    {
        id: "serv-14",
        category: "SERVICE",
        persona: "Tech-challenged user",
        scenario: "Computer or phone repair",
        tone: "satisfied",
        focusPoints: ["patience", "explanation", "data safety"],
    },
    {
        id: "serv-15",
        category: "SERVICE",
        persona: "Wedding planner",
        scenario: "Hired for special event",
        tone: "enthusiastic",
        focusPoints: ["attention to detail", "flexibility", "creativity"],
    },
    {
        id: "serv-16",
        category: "SERVICE",
        persona: "Small business owner",
        scenario: "B2B service needed",
        tone: "professional",
        focusPoints: ["professionalism", "invoicing", "communication"],
    },
    {
        id: "serv-17",
        category: "SERVICE",
        persona: "Renovation project manager",
        scenario: "Part of larger project",
        tone: "detailed",
        focusPoints: ["coordination", "timeline", "quality"],
    },
    {
        id: "serv-18",
        category: "SERVICE",
        persona: "Insurance claim filer",
        scenario: "Needed documentation for claim",
        tone: "professional",
        focusPoints: ["documentation", "thoroughness", "cooperation"],
    },
    {
        id: "serv-19",
        category: "SERVICE",
        persona: "Eco-conscious customer",
        scenario: "Interested in sustainable options",
        tone: "satisfied",
        focusPoints: ["eco-friendly", "responsible disposal", "green options"],
    },
    {
        id: "serv-20",
        category: "SERVICE",
        persona: "Night shift worker",
        scenario: "Needed service at odd hours",
        tone: "enthusiastic",
        focusPoints: ["availability", "no extra charge", "understanding"],
    },
    {
        id: "serv-21",
        category: "SERVICE",
        persona: "DIY person who gave up",
        scenario: "Tried to fix it myself first",
        tone: "casual",
        focusPoints: ["no judgment", "quick fix", "education"],
    },
    {
        id: "serv-22",
        category: "SERVICE",
        persona: "Referral from friend",
        scenario: "Friend recommended this service",
        tone: "satisfied",
        focusPoints: ["lived up to expectation", "will refer others", "trust"],
    },
    {
        id: "serv-23",
        category: "SERVICE",
        persona: "Quote comparison shopper",
        scenario: "Got multiple quotes",
        tone: "detailed",
        focusPoints: ["competitive pricing", "value", "no hidden fees"],
    },
    {
        id: "serv-24",
        category: "SERVICE",
        persona: "Seasonal service user",
        scenario: "Annual maintenance (HVAC, pool, etc.)",
        tone: "casual",
        focusPoints: ["reminder system", "consistent quality", "scheduling"],
    },
    {
        id: "serv-25",
        category: "SERVICE",
        persona: "Warranty service user",
        scenario: "Using warranty for repair",
        tone: "satisfied",
        focusPoints: ["warranty handling", "no hassle", "genuine parts"],
    },
];

// ============================================
// RETAIL CONTEXTS (20+)
// ============================================
const retailContexts: ReviewContext[] = [
    {
        id: "ret-01",
        category: "RETAIL",
        persona: "Gift shopper",
        scenario: "Looking for a birthday present",
        tone: "enthusiastic",
        focusPoints: ["gift wrapping", "selection", "staff help"],
    },
    {
        id: "ret-02",
        category: "RETAIL",
        persona: "Bargain hunter",
        scenario: "Found a great deal",
        tone: "satisfied",
        focusPoints: ["prices", "sales", "value"],
    },
    {
        id: "ret-03",
        category: "RETAIL",
        persona: "Online order picker",
        scenario: "Click and collect order",
        tone: "casual",
        focusPoints: ["convenience", "speed", "accuracy"],
    },
    {
        id: "ret-04",
        category: "RETAIL",
        persona: "Return/exchange customer",
        scenario: "Needed to return an item",
        tone: "satisfied",
        focusPoints: ["return policy", "no hassle", "staff attitude"],
    },
    {
        id: "ret-05",
        category: "RETAIL",
        persona: "Local supporter",
        scenario: "Prefers local over chains",
        tone: "enthusiastic",
        focusPoints: ["local business", "unique items", "community"],
    },
    {
        id: "ret-06",
        category: "RETAIL",
        persona: "Fashion conscious shopper",
        scenario: "Looking for trendy clothes",
        tone: "detailed",
        focusPoints: ["style", "quality", "fitting room"],
    },
    {
        id: "ret-07",
        category: "RETAIL",
        persona: "Electronics buyer",
        scenario: "Purchasing tech product",
        tone: "professional",
        focusPoints: ["product knowledge", "warranty", "setup help"],
    },
    {
        id: "ret-08",
        category: "RETAIL",
        persona: "Home decor enthusiast",
        scenario: "Redecorating a room",
        tone: "enthusiastic",
        focusPoints: ["selection", "inspiration", "quality"],
    },
    {
        id: "ret-09",
        category: "RETAIL",
        persona: "Parent shopping for kids",
        scenario: "Back to school shopping",
        tone: "satisfied",
        focusPoints: ["kids section", "durability", "prices"],
    },
    {
        id: "ret-10",
        category: "RETAIL",
        persona: "Hobby enthusiast",
        scenario: "Specialized hobby store visit",
        tone: "detailed",
        focusPoints: ["expertise", "niche products", "community feel"],
    },
    {
        id: "ret-11",
        category: "RETAIL",
        persona: "Grocery shopper",
        scenario: "Weekly grocery run",
        tone: "casual",
        focusPoints: ["freshness", "organization", "checkout speed"],
    },
    {
        id: "ret-12",
        category: "RETAIL",
        persona: "Luxury buyer",
        scenario: "Treating myself to something nice",
        tone: "professional",
        focusPoints: ["exclusivity", "service", "packaging"],
    },
    {
        id: "ret-13",
        category: "RETAIL",
        persona: "Plant lover",
        scenario: "Garden center visit",
        tone: "enthusiastic",
        focusPoints: ["plant health", "variety", "advice"],
    },
    {
        id: "ret-14",
        category: "RETAIL",
        persona: "Book lover",
        scenario: "Browsing at bookstore",
        tone: "detailed",
        focusPoints: ["selection", "atmosphere", "recommendations"],
    },
    {
        id: "ret-15",
        category: "RETAIL",
        persona: "Sports equipment buyer",
        scenario: "Getting gear for new hobby",
        tone: "satisfied",
        focusPoints: ["quality", "fit", "staff expertise"],
    },
    {
        id: "ret-16",
        category: "RETAIL",
        persona: "Art supply shopper",
        scenario: "Restocking creative materials",
        tone: "casual",
        focusPoints: ["variety", "brands", "pricing"],
    },
    {
        id: "ret-17",
        category: "RETAIL",
        persona: "Cosmetics shopper",
        scenario: "Trying new makeup",
        tone: "enthusiastic",
        focusPoints: ["testers", "advice", "brands"],
    },
    {
        id: "ret-18",
        category: "RETAIL",
        persona: "Furniture buyer",
        scenario: "Furnishing new apartment",
        tone: "detailed",
        focusPoints: ["quality", "delivery", "assembly"],
    },
    {
        id: "ret-19",
        category: "RETAIL",
        persona: "Wine buyer",
        scenario: "Choosing wine for dinner party",
        tone: "professional",
        focusPoints: ["selection", "sommelier advice", "price range"],
    },
    {
        id: "ret-20",
        category: "RETAIL",
        persona: "Pharmacy customer",
        scenario: "Picking up prescription + products",
        tone: "satisfied",
        focusPoints: ["pharmacist help", "product range", "wait time"],
    },
];

// ============================================
// MEDICAL CONTEXTS (15+)
// ============================================
const medicalContexts: ReviewContext[] = [
    {
        id: "med-01",
        category: "MEDICAL",
        persona: "First-time patient",
        scenario: "New to this doctor/clinic",
        tone: "satisfied",
        focusPoints: ["welcome process", "wait time", "doctor manner"],
    },
    {
        id: "med-02",
        category: "MEDICAL",
        persona: "Chronic condition patient",
        scenario: "Regular checkup for ongoing condition",
        tone: "professional",
        focusPoints: ["follow-up care", "knowledge", "treatment plan"],
    },
    {
        id: "med-03",
        category: "MEDICAL",
        persona: "Parent with sick child",
        scenario: "Urgent visit for child",
        tone: "enthusiastic",
        focusPoints: ["child-friendly", "patience", "fast attention"],
    },
    {
        id: "med-04",
        category: "MEDICAL",
        persona: "Dental patient",
        scenario: "Routine cleaning or procedure",
        tone: "satisfied",
        focusPoints: ["pain management", "explanation", "hygienist skill"],
    },
    {
        id: "med-05",
        category: "MEDICAL",
        persona: "Anxious patient",
        scenario: "Nervous about procedure",
        tone: "detailed",
        focusPoints: ["calming approach", "explanation", "reassurance"],
    },
    {
        id: "med-06",
        category: "MEDICAL",
        persona: "Senior patient",
        scenario: "Needs extra care and time",
        tone: "satisfied",
        focusPoints: ["patience", "accessibility", "clear instructions"],
    },
    {
        id: "med-07",
        category: "MEDICAL",
        persona: "Physical therapy patient",
        scenario: "Recovery from injury",
        tone: "enthusiastic",
        focusPoints: ["progress", "motivation", "exercise plan"],
    },
    {
        id: "med-08",
        category: "MEDICAL",
        persona: "Eye exam patient",
        scenario: "Annual eye checkup",
        tone: "casual",
        focusPoints: ["thoroughness", "frame selection", "prescription accuracy"],
    },
    {
        id: "med-09",
        category: "MEDICAL",
        persona: "Pregnant mother",
        scenario: "Prenatal checkup",
        tone: "detailed",
        focusPoints: ["care", "information", "comfort"],
    },
    {
        id: "med-10",
        category: "MEDICAL",
        persona: "Mental health patient",
        scenario: "Therapy or counseling session",
        tone: "professional",
        focusPoints: ["confidentiality", "empathy", "progress"],
    },
    {
        id: "med-11",
        category: "MEDICAL",
        persona: "Dermatology patient",
        scenario: "Skin concern consultation",
        tone: "satisfied",
        focusPoints: ["diagnosis", "treatment options", "follow-up"],
    },
    {
        id: "med-12",
        category: "MEDICAL",
        persona: "Orthopedic patient",
        scenario: "Joint or bone issue",
        tone: "detailed",
        focusPoints: ["imaging", "explanation", "treatment plan"],
    },
    {
        id: "med-13",
        category: "MEDICAL",
        persona: "Allergy patient",
        scenario: "Allergy testing or treatment",
        tone: "satisfied",
        focusPoints: ["testing process", "results explanation", "relief"],
    },
    {
        id: "med-14",
        category: "MEDICAL",
        persona: "Surgery patient",
        scenario: "Pre or post-op care",
        tone: "enthusiastic",
        focusPoints: ["preparation", "care", "recovery support"],
    },
    {
        id: "med-15",
        category: "MEDICAL",
        persona: "Telehealth user",
        scenario: "Online consultation",
        tone: "casual",
        focusPoints: ["convenience", "tech quality", "doctor attention"],
    },
];

// ============================================
// GENERAL CONTEXTS (15+)
// ============================================
const generalContexts: ReviewContext[] = [
    {
        id: "gen-01",
        category: "GENERAL",
        persona: "Impressed customer",
        scenario: "Exceeded all expectations",
        tone: "enthusiastic",
        focusPoints: ["surprise", "quality", "recommendation"],
    },
    {
        id: "gen-02",
        category: "GENERAL",
        persona: "Satisfied regular",
        scenario: "Consistent good experience",
        tone: "casual",
        focusPoints: ["reliability", "consistency", "trust"],
    },
    {
        id: "gen-03",
        category: "GENERAL",
        persona: "Value-focused customer",
        scenario: "Got great value for money",
        tone: "satisfied",
        focusPoints: ["price-quality ratio", "no hidden costs", "worth it"],
    },
    {
        id: "gen-04",
        category: "GENERAL",
        persona: "Problem resolver",
        scenario: "Had an issue that was fixed",
        tone: "professional",
        focusPoints: ["problem resolution", "follow-up", "care"],
    },
    {
        id: "gen-05",
        category: "GENERAL",
        persona: "Recommendation follower",
        scenario: "Came because of good reviews",
        tone: "satisfied",
        focusPoints: ["lived up to reviews", "as described", "will return"],
    },
    {
        id: "gen-06",
        category: "GENERAL",
        persona: "Loyal customer",
        scenario: "Using for years, still great",
        tone: "enthusiastic",
        focusPoints: ["longevity", "evolution", "loyalty rewarded"],
    },
    {
        id: "gen-07",
        category: "GENERAL",
        persona: "First-time skeptic converted",
        scenario: "Was skeptical but impressed",
        tone: "detailed",
        focusPoints: ["initial doubt", "pleasant surprise", "conversion"],
    },
    {
        id: "gen-08",
        category: "GENERAL",
        persona: "Convenience seeker",
        scenario: "Easy and hassle-free experience",
        tone: "casual",
        focusPoints: ["ease", "speed", "no complications"],
    },
    {
        id: "gen-09",
        category: "GENERAL",
        persona: "Quality-focused buyer",
        scenario: "Prioritizes quality over price",
        tone: "professional",
        focusPoints: ["premium quality", "craftsmanship", "durability"],
    },
    {
        id: "gen-10",
        category: "GENERAL",
        persona: "Friendly neighborhood customer",
        scenario: "Lives nearby, uses frequently",
        tone: "casual",
        focusPoints: ["proximity", "familiarity", "community"],
    },
    {
        id: "gen-11",
        category: "GENERAL",
        persona: "Online reviewer",
        scenario: "Shares experiences to help others",
        tone: "detailed",
        focusPoints: ["helpfulness", "honest assessment", "tips"],
    },
    {
        id: "gen-12",
        category: "GENERAL",
        persona: "Birthday celebrant",
        scenario: "Special treatment on birthday",
        tone: "enthusiastic",
        focusPoints: ["special touch", "celebration", "memories"],
    },
    {
        id: "gen-13",
        category: "GENERAL",
        persona: "Accessibility-focused customer",
        scenario: "Appreciated accessible features",
        tone: "satisfied",
        focusPoints: ["accessibility", "inclusivity", "thoughtfulness"],
    },
    {
        id: "gen-14",
        category: "GENERAL",
        persona: "Environmentally conscious",
        scenario: "Appreciates eco-friendly practices",
        tone: "professional",
        focusPoints: ["sustainability", "eco practices", "responsibility"],
    },
    {
        id: "gen-15",
        category: "GENERAL",
        persona: "Simple needs customer",
        scenario: "Just wanted basic service, got it",
        tone: "casual",
        focusPoints: ["simplicity", "no fuss", "straightforward"],
    },
];

// ============================================
// COMBINED EXPORT
// ============================================
export const ALL_CONTEXTS: ReviewContext[] = [
    ...restaurantContexts,
    ...serviceContexts,
    ...retailContexts,
    ...medicalContexts,
    ...generalContexts,
];

export const CONTEXT_COUNT = ALL_CONTEXTS.length;

/**
 * Get N random unique contexts from the library
 */
export function getRandomContexts(count: number, category?: ReviewContext["category"]): ReviewContext[] {
    const pool = category ? ALL_CONTEXTS.filter(c => c.category === category) : ALL_CONTEXTS;

    // Shuffle using Fisher-Yates
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get a single random context
 */
export function getRandomContext(category?: ReviewContext["category"]): ReviewContext {
    return getRandomContexts(1, category)[0];
}
