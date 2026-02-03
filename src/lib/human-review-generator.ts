/**
 * Human-Like Review Generator
 *
 * Anti-AI Detection System for generating authentic Google Maps reviews
 * that cannot be detected as AI-generated.
 *
 * Key Principles:
 * 1. Imperfections - Real humans aren't perfect
 * 2. Specificity - Details over generic praise
 * 3. Varied structure - No repetitive patterns
 * 4. Emotional authenticity - Real feelings, not marketing
 * 5. Colloquialisms - Natural expressions
 * 6. Brevity variations - Not every review is the same length
 */

// ============================================
// ANTI-AI DETECTION PATTERNS
// ============================================

/**
 * AI Detection Red Flags to AVOID:
 * - Perfect grammar always
 * - Repetitive sentence structures (Subject-Verb-Object)
 * - Generic superlatives ("amazing", "excellent", "best ever")
 * - Marketing language ("highly recommend", "5 stars")
 * - Too balanced (always pros and cons)
 * - Formal tone throughout
 * - Perfect punctuation
 * - No contractions
 * - No colloquialisms
 * - Equal sentence lengths
 * - No personal details
 * - No specific experiences
 */

// ============================================
// HUMAN WRITING PATTERNS
// ============================================

// French sentence starters - natural variations
export const SENTENCE_STARTERS = {
    positive: [
        "Franchement,",
        "Honnêtement,",
        "Ben,",
        "Bon,",
        "Alors là,",
        "J'avoue,",
        "En vrai,",
        "Perso,",
        "Sincèrement,",
        "",  // Sometimes no starter
        "",
        "",
    ],
    neutral: [
        "Alors,",
        "Bon ben,",
        "Voilà,",
        "Bref,",
        "Enfin,",
        "Du coup,",
        "",
        "",
    ],
    experience: [
        "On a fait appel à eux",
        "J'ai contacté",
        "Mon voisin m'avait recommandé",
        "Trouvé sur Google",
        "Suite à un problème",
        "Après avoir cherché",
        "Un ami m'a conseillé",
    ],
};

// Specific detail generators by business type
export const SPECIFIC_DETAILS = {
    roofing: [
        "fuite au niveau du toit",
        "tuiles cassées après la tempête",
        "gouttière bouchée",
        "problème d'infiltration",
        "toiture à refaire",
        "ardoises à remplacer",
        "nettoyage de mousse",
        "isolation sous toiture",
        "velux qui fuyait",
        "charpente à vérifier",
    ],
    plumbing: [
        "fuite sous l'évier",
        "chauffe-eau en panne",
        "toilettes bouchées",
        "problème de pression",
        "tuyau percé",
        "chasse d'eau qui coulait",
        "robinet qui goutte",
        "ballon d'eau chaude",
        "canalisation bouchée",
    ],
    electrical: [
        "panne de courant",
        "tableau électrique",
        "prises qui sautaient",
        "installation aux normes",
        "éclairage extérieur",
        "domotique",
        "mise aux normes",
        "court-circuit",
    ],
    restaurant: [
        "midi en semaine",
        "dîner en amoureux",
        "repas de famille",
        "terrasse agréable",
        "menu du jour",
        "carte variée",
        "plat du chef",
        "dessert maison",
    ],
    general: [
        "premier contact",
        "devis rapide",
        "intervention efficace",
        "travail propre",
        "équipe sympa",
        "bon rapport qualité-prix",
        "délais respectés",
    ],
};

// Human imperfection patterns (makes text more authentic)
export const AUTHENTICITY_MARKERS = {
    // Minor informal touches
    informal: [
        "super",
        "top",
        "nickel",
        "impec",
        "tip top",
        "au top",
        "vraiment bien",
        "pas mal du tout",
        "rien à dire",
    ],
    // Natural hedging (humans don't speak in absolutes)
    hedging: [
        "plutôt",
        "assez",
        "franchement",
        "vraiment",
        "carrément",
        "je trouve que",
        "perso",
        "pour moi",
    ],
    // Time references (makes it specific)
    timeReferences: [
        "l'autre jour",
        "la semaine dernière",
        "y a pas longtemps",
        "récemment",
        "il y a quelques semaines",
        "le mois dernier",
        "cet hiver",
        "pendant les vacances",
    ],
    // Personal touches
    personal: [
        "ma femme/mon mari",
        "mes parents",
        "mon voisin",
        "un collègue",
        "des amis",
        "ma belle-mère",
        "notre proprio",
    ],
};

// Ending variations (humans don't always end the same way)
export const ENDINGS = {
    recommendation: [
        "Je recommande.",
        "À recommander.",
        "Je conseille.",
        "N'hésitez pas.",
        "Allez-y les yeux fermés.",
        "Je referai appel à eux.",
        "Je garde le contact.",
        "Adresse à garder.",
    ],
    satisfaction: [
        "Très content.",
        "Vraiment satisfait.",
        "Rien à redire.",
        "Nickel.",
        "Parfait.",
        "Impeccable.",
        "Que du positif.",
        "Top.",
    ],
    neutral: [
        "Merci à l'équipe.",
        "Bon travail.",
        "Merci.",
        "Voilà.",
        "",  // Sometimes no ending
        "",
        "",
    ],
};

// ============================================
// WRITING STYLE VARIATIONS
// ============================================

export type WritingStyle =
    | "casual_short"      // "Super service, rapide et efficace. Merci!"
    | "story_teller"      // "Suite à une fuite, j'ai appelé... Résultat: nickel!"
    | "matter_of_fact"    // "Intervention rapide. Travail propre. Prix correct."
    | "enthusiastic"      // "Franchement top! Équipe au top, travail impec!"
    | "detailed_reviewer" // "Après plusieurs devis, j'ai choisi... Le travail a été..."
    | "minimalist";       // "Bien." / "OK" / "Sérieux."

export const STYLE_CONFIGS: Record<WritingStyle, {
    sentenceCount: [number, number];
    avgWordCount: [number, number];
    useStarter: number;  // probability 0-1
    useEnding: number;
    usePunctuation: "strict" | "casual" | "minimal";
    tone: "formal" | "casual" | "very_casual";
}> = {
    casual_short: {
        sentenceCount: [1, 2],
        avgWordCount: [5, 15],
        useStarter: 0.3,
        useEnding: 0.5,
        usePunctuation: "casual",
        tone: "casual",
    },
    story_teller: {
        sentenceCount: [2, 4],
        avgWordCount: [15, 30],
        useStarter: 0.7,
        useEnding: 0.6,
        usePunctuation: "casual",
        tone: "casual",
    },
    matter_of_fact: {
        sentenceCount: [2, 3],
        avgWordCount: [8, 15],
        useStarter: 0.2,
        useEnding: 0.4,
        usePunctuation: "minimal",
        tone: "formal",
    },
    enthusiastic: {
        sentenceCount: [1, 3],
        avgWordCount: [10, 20],
        useStarter: 0.6,
        useEnding: 0.7,
        usePunctuation: "casual",
        tone: "very_casual",
    },
    detailed_reviewer: {
        sentenceCount: [3, 5],
        avgWordCount: [20, 40],
        useStarter: 0.5,
        useEnding: 0.8,
        usePunctuation: "strict",
        tone: "formal",
    },
    minimalist: {
        sentenceCount: [1, 1],
        avgWordCount: [2, 8],
        useStarter: 0.1,
        useEnding: 0.2,
        usePunctuation: "minimal",
        tone: "casual",
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldDo(probability: number): boolean {
    return Math.random() < probability;
}

export function getRandomStyle(): WritingStyle {
    const styles: WritingStyle[] = [
        "casual_short",
        "casual_short",      // More weight to casual
        "story_teller",
        "matter_of_fact",
        "matter_of_fact",    // More weight to matter of fact
        "enthusiastic",
        "detailed_reviewer",
        "minimalist",
        "minimalist",        // More weight to minimalist
    ];
    return randomChoice(styles);
}

export function getSpecificDetail(businessType: string): string {
    const lower = businessType.toLowerCase();

    if (lower.includes("roof") || lower.includes("toiture")) {
        return randomChoice(SPECIFIC_DETAILS.roofing);
    }
    if (lower.includes("plumb") || lower.includes("plombier")) {
        return randomChoice(SPECIFIC_DETAILS.plumbing);
    }
    if (lower.includes("electric") || lower.includes("électric")) {
        return randomChoice(SPECIFIC_DETAILS.electrical);
    }
    if (lower.includes("restaurant") || lower.includes("food") || lower.includes("pizza")) {
        return randomChoice(SPECIFIC_DETAILS.restaurant);
    }

    return randomChoice(SPECIFIC_DETAILS.general);
}

// ============================================
// MASTER PROMPT BUILDER
// ============================================

export interface HumanPromptConfig {
    businessName: string;
    businessType: string;
    businessCategory: string;
    style?: WritingStyle;
    userHint?: string;
    templateInstruction?: string;
}

export function buildHumanLikePrompt(config: HumanPromptConfig): string {
    const style = config.style || getRandomStyle();
    const styleConfig = STYLE_CONFIGS[style];

    // Get specific detail for this business type
    const specificDetail = getSpecificDetail(config.businessType);

    // Random elements
    const useStarter = shouldDo(styleConfig.useStarter);
    const starter = useStarter ? randomChoice(SENTENCE_STARTERS.positive) : "";
    const timeRef = shouldDo(0.4) ? randomChoice(AUTHENTICITY_MARKERS.timeReferences) : "";
    const personalRef = shouldDo(0.25) ? randomChoice(AUTHENTICITY_MARKERS.personal) : "";
    const informalWord = randomChoice(AUTHENTICITY_MARKERS.informal);

    // Build the prompt
    const prompt = `Tu es un CLIENT FRANÇAIS qui écrit un avis Google Maps après avoir utilisé "${config.businessName}" (${config.businessType}).

CONTEXTE DE TON EXPÉRIENCE:
- Tu as eu besoin de: ${specificDetail}
${timeRef ? `- C'était: ${timeRef}` : ""}
${personalRef ? `- ${personalRef} t'avait peut-être recommandé ou tu as cherché toi-même` : ""}

STYLE D'ÉCRITURE: ${style.replace("_", " ").toUpperCase()}
- Nombre de phrases: ${styleConfig.sentenceCount[0]}-${styleConfig.sentenceCount[1]}
- Longueur: ${styleConfig.avgWordCount[0]}-${styleConfig.avgWordCount[1]} mots au total
- Ton: ${styleConfig.tone === "very_casual" ? "très familier" : styleConfig.tone === "casual" ? "décontracté" : "neutre"}
${starter ? `- Commence par: "${starter}"` : "- Pas besoin de formule d'intro"}

RÈGLES CRITIQUES ANTI-IA (TRÈS IMPORTANT):
1. JAMAIS de mots marketing: "excellent", "exceptionnel", "hautement recommandé", "5 étoiles"
2. JAMAIS de structure parfaite - les vrais gens écrivent de façon naturelle
3. PAS de ponctuation excessive (pas de !!!! ou de ...)
4. UTILISE des mots familiers français: "${informalWord}", "nickel", "impec", "pas mal"
5. SOIS SPÉCIFIQUE - mentionne le problème concret (${specificDetail})
6. GARDE ÇA COURT et naturel - les vrais avis ne sont pas des dissertations
7. PAS de "je recommande vivement" ou "n'hésitez pas à" (trop commercial)
8. Écris comme tu parlerais à un ami qui te demande "c'était bien?"
9. VARIE la structure des phrases - pas toujours Sujet-Verbe-Complément
10. PARFOIS une phrase suffit. Pas besoin de toujours développer.

EXEMPLES DE BONS AVIS (INSPIRE-TOI DU STYLE, PAS DU CONTENU):
- "Fuite réparée en 2h. Pro et sympa."
- "Bon, j'avoue j'étais sceptique mais au final nickel. Équipe sérieuse."
- "RAS, travail propre, on voit que c'est du pro."
- "Intervention rapide suite à un problème de ${specificDetail}. Satisfait."
- "Top. Je garde le numéro."

${config.templateInstruction ? `\nINSTRUCTIONS TEMPLATE:\n${config.templateInstruction}` : ""}
${config.userHint ? `\nDÉTAIL À INCLURE: "${config.userHint}"` : ""}

ÉCRIS L'AVIS MAINTENANT (français uniquement, sans guillemets autour):`;

    return prompt;
}

// ============================================
// ALTERNATIVE PROMPTS (for variation)
// ============================================

export function buildMinimalPrompt(config: HumanPromptConfig): string {
    const detail = getSpecificDetail(config.businessType);

    return `Écris un TRÈS COURT avis Google Maps (1-2 phrases max) pour "${config.businessName}".
Le client a eu besoin de: ${detail}
Ton: français familier, naturel, pas commercial.
Exemples de style: "Nickel, rapide et efficace" / "Bon travail, je recommande" / "RAS, pro"
${config.userHint ? `Mentionne: ${config.userHint}` : ""}
Écris juste l'avis:`;
}

export function buildStoryPrompt(config: HumanPromptConfig): string {
    const detail = getSpecificDetail(config.businessType);
    const timeRef = randomChoice(AUTHENTICITY_MARKERS.timeReferences);

    return `Tu es un client français. Raconte BRIÈVEMENT (2-3 phrases) ton expérience avec "${config.businessName}" (${config.businessType}).

Situation: ${timeRef}, tu as eu un problème de ${detail}.
Tu as fait appel à eux, et ça s'est bien passé.

Règles:
- Parle comme à un ami
- Pas de "excellent" ou "je recommande vivement"
- Mots OK: super, nickel, top, bien, satisfait, pro
- Sois naturel et concis

${config.userHint ? `Mentionne: ${config.userHint}` : ""}

Écris l'avis:`;
}

// ============================================
// PROMPT SELECTOR (random variation)
// ============================================

export function getHumanLikePrompt(config: HumanPromptConfig): string {
    const rand = Math.random();

    if (rand < 0.15) {
        // 15% - Ultra minimal
        return buildMinimalPrompt(config);
    } else if (rand < 0.35) {
        // 20% - Story style
        return buildStoryPrompt(config);
    } else {
        // 65% - Standard with random style
        return buildHumanLikePrompt(config);
    }
}

// ============================================
// POST-PROCESSING
// ============================================

export function postProcessReview(text: string): string {
    let processed = text.trim();

    // Remove surrounding quotes
    processed = processed.replace(/^["'«»]|["'«»]$/g, "");

    // Remove excessive punctuation
    processed = processed.replace(/!{2,}/g, "!");
    processed = processed.replace(/\.{4,}/g, "...");

    // Occasionally add minor imperfections (5% chance each)
    if (shouldDo(0.05)) {
        // Sometimes miss a space after punctuation (then fix it)
        processed = processed.replace(/\. ([A-Z])/g, ".$1");
    }

    return processed;
}
