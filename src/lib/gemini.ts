import { GoogleGenAI } from "@google/genai";
import { getRandomContext, getRandomContexts, ReviewContext } from "./ai-contexts";

// Initialize Gemini client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// ============================================
// LEGACY INTERFACE (Keeping for backward compat)
// ============================================
export interface ReviewGenerationOptions {
    businessName: string;
    category: string;
    style?: "detailed" | "short" | "enthusiastic";
}

/**
 * Generate a GMB review using Gemini AI (Legacy)
 */
export async function generateReview(
    options: ReviewGenerationOptions
): Promise<string> {
    const { businessName, category, style = "detailed" } = options;

    const styleInstructions = {
        detailed:
            "Write a detailed, helpful review (minimum 40 words). Describe the service, the team, and the result in detail. Use 3-5 complete sentences.",
        short: "Write a moderate length review (minimum 30 words). Do NOT be too brief. Use at least 3 full sentences.",
        enthusiastic:
            "Write an enthusiastic, highly positive review (minimum 40 words) with strong recommendations and specific praise.",
    };

    const prompt = `You are helping write a Google Maps review for a ${category} business called "${businessName}".

Instructions:
- ${styleInstructions[style]}
- Sound like a real customer, not a bot
- Be specific but don't make up details that could be false
- Follow Google's review policies (no fake claims, no incentivized language)
- Don't mention getting incentives or discounts for the review
- Use natural language with occasional minor imperfections
- Don't use excessive exclamation marks or all caps
- Focus on service quality, atmosphere, and experience
- LENGTH RULE: The review MUST be substantial. It must be at least 30-50 words long. 
- FORBIDDEN: Do NOT write single-line reviews. Do NOT write short 3-word sentences.

Write ONLY the review text, nothing else.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: prompt,
        });

        const text = response.text?.trim() || "";

        // Clean up any quotes the model might add
        return text.replace(/^["']|["']$/g, "");
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate review");
    }
}

/**
 * Generate multiple reviews for batch operations (Legacy)
 */
export async function generateBatchReviews(
    items: ReviewGenerationOptions[]
): Promise<string[]> {
    const results = await Promise.allSettled(
        items.map(async (item) => {
            return generateReview(item);
        })
    );

    return results.map((result) => {
        if (result.status === "fulfilled") {
            return result.value;
        } else {
            console.error("Review generation failed:", result.reason);
            return ""; // Return empty string on failure
        }
    });
}


// ============================================
// ADVANCED GENERATION (V2)
// ============================================

export type TargetLanguage = "french" | "english";

export interface AdvancedReviewOptions {
    businessName: string;
    businessCategory?: "RESTAURANT" | "SERVICE" | "RETAIL" | "MEDICAL" | "GENERAL";
    language?: TargetLanguage;
    userHint?: string; // Optional brief hint from user (can be in Bangla/English)
}

/**
 * Build a rich prompt from a context persona
 */
function buildAdvancedPrompt(ctx: ReviewContext, opts: AdvancedReviewOptions): string {
    const langInstruction = opts.language === "english"
        ? "Write the review in English."
        : "Tu es un client français. Écris l'avis EN FRANÇAIS uniquement.";

    const toneMap: Record<ReviewContext["tone"], string> = {
        enthusiastic: "Very positive and excited.",
        satisfied: "Happy and content.",
        professional: "Formal and businesslike.",
        casual: "Relaxed and friendly.",
        detailed: "Thorough with specific observations.",
    };

    const focusStr = ctx.focusPoints.map(f => `- ${f}`).join("\n");

    return `You are writing a Google Maps review for "${opts.businessName}".

YOUR PERSONA: ${ctx.persona}
YOUR SCENARIO: ${ctx.scenario}
YOUR TONE: ${toneMap[ctx.tone]}

FOCUS ON THESE ASPECTS:
${focusStr}

LANGUAGE INSTRUCTION:
${langInstruction}

RULES:
- Sound like a REAL human customer, NOT a bot or AI.
- Use natural language. Include minor imperfections sometimes (like "uhm", "haha", "..." or short sentences).
- DO NOT use marketing language, excessive exclamation marks, or perfect grammar.
- LENGTH REQUIREMENT: The review MUST be substantial (approx 40-60 words). 
- FORMAT: Write 3-5 full sentences. Do NOT write a single short line.
- AVOID mentioning discounts, incentives, or "5 stars".
- NO quotes around your response.
${opts.userHint ? `\nADDITIONAL CONTEXT FROM USER: "${opts.userHint}"` : ""}

NOW WRITE THE REVIEW (ONLY the review text, nothing else):`;
}

/**
 * Generate a single advanced review using a random persona
 */
export async function generateAdvancedReview(opts: AdvancedReviewOptions): Promise<string> {
    const ctx = getRandomContext(opts.businessCategory);
    const prompt = buildAdvancedPrompt(ctx, opts);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: prompt,
            config: {
                temperature: 0.9, // Higher for more variety
                topP: 0.95,
            },
        });

        let text = response.text?.trim() || "";
        // Clean up quotes
        text = text.replace(/^["'«»]|["'«»]$/g, "");
        return text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate advanced review");
    }
}

/**
 * Generate multiple unique reviews with different personas
 */
export async function generateBatchAdvancedReviews(
    opts: AdvancedReviewOptions,
    count: number
): Promise<string[]> {
    // Get unique contexts for each review
    const contexts = getRandomContexts(count, opts.businessCategory);

    const results = await Promise.allSettled(
        contexts.map(async (ctx) => {
            const prompt = buildAdvancedPrompt(ctx, opts);
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-thinking-exp",
                contents: prompt,
                config: {
                    temperature: 0.9 + Math.random() * 0.1, // Slight variance
                    topP: 0.95,
                },
            });
            let text = response.text?.trim() || "";
            text = text.replace(/^["'«»]|["'«»]$/g, "");
            return text;
        })
    );

    return results.map((result, i) => {
        if (result.status === "fulfilled") {
            return result.value;
        } else {
            console.error(`Review ${i + 1} generation failed:`, result.reason);
            return "";
        }
    });
}

export async function quickGenerateFromHint(
    businessName: string,
    userHint: string,
    language: TargetLanguage = "french"
): Promise<string> {
    const langInstruction = language === "english"
        ? "Write the review in English."
        : "Tu es un client français. Écris l'avis EN FRANÇAIS uniquement.";

    const prompt = `Transform this brief note into a natural Google Maps review for "${businessName}":

USER'S NOTE: "${userHint}"

${langInstruction}

RULES:
- Expand the note into a natural review (minimum 30 words, 3-5 sentences).
- Sound like a real customer.
- Keep the same sentiment as the note.
- NO quotes, NO "5 stars", NO marketing language.
- DO NOT be brief. Elaborate on the experience.

WRITE THE REVIEW (only the text):`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: prompt,
            config: { temperature: 0.8 },
        });

        let text = response.text?.trim() || "";
        text = text.replace(/^["'«»]|["'«»]$/g, "");
        return text;
    } catch (error) {
        console.error("Quick generate error:", error);
        throw new Error("Failed to generate review");
    }
}


// ============================================
// DUAL LANGUAGE GENERATION (V3)
// ============================================

export interface DualLanguageResult {
    french: string;
    bangla: string;
    profileId?: string;
}

/**
 * Generate a review in French and translate to Bangla
 */
export async function generateDualLanguage(
    opts: AdvancedReviewOptions & { profileId?: string }
): Promise<DualLanguageResult> {
    const ctx = getRandomContext(opts.businessCategory);
    const prompt = buildAdvancedPrompt(ctx, { ...opts, language: "french" });

    try {
        // Step 1: Generate French review
        const frenchResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: prompt,
            config: { temperature: 0.9 },
        });

        let french = frenchResponse.text?.trim() || "";
        french = french.replace(/^["'«»]|["'«»]$/g, "");

        // Step 2: Translate to Bangla
        const translatePrompt = `Translate this French review to Bangla (Bengali). Keep it natural and conversational.

FRENCH TEXT: "${french}"

TRANSLATION RULES:
- Write in Bangla (বাংলা) script.
- Keep the same meaning and tone.
- Make it sound natural, not robotic.
- ONLY output the Bangla translation, nothing else.`;

        const banglaResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: translatePrompt,
            config: { temperature: 0.5 },
        });

        let bangla = banglaResponse.text?.trim() || "";
        bangla = bangla.replace(/^["'«»]|["'«»]$/g, "");

        return {
            french,
            bangla,
            profileId: opts.profileId,
        };
    } catch (error) {
        console.error("Dual language generation error:", error);
        throw new Error("Failed to generate dual language review");
    }
}

/**
 * Generate multiple reviews with both French and Bangla
 */
export async function generateBatchDualLanguage(
    opts: AdvancedReviewOptions & { profileId?: string },
    count: number
): Promise<DualLanguageResult[]> {
    const contexts = getRandomContexts(count, opts.businessCategory);

    const results: DualLanguageResult[] = [];

    // Process sequentially to avoid rate limits
    for (const ctx of contexts) {
        try {
            const prompt = buildAdvancedPrompt(ctx, { ...opts, language: "french" });

            // Generate French
            const frenchResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash-thinking-exp",
                contents: prompt,
                config: { temperature: 0.9 + Math.random() * 0.1 },
            });

            let french = frenchResponse.text?.trim() || "";
            french = french.replace(/^["'«»]|["'«»]$/g, "");

            // Translate to Bangla
            const translatePrompt = `Translate to Bangla (বাংলা): "${french}"
Only output the Bangla translation.`;

            const banglaResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash-thinking-exp",
                contents: translatePrompt,
                config: { temperature: 0.5 },
            });

            let bangla = banglaResponse.text?.trim() || "";
            bangla = bangla.replace(/^["'«»]|["'«»]$/g, "");

            results.push({ french, bangla, profileId: opts.profileId });
        } catch (error) {
            console.error("Batch dual language error:", error);
            results.push({ french: "", bangla: "", profileId: opts.profileId });
        }
    }

    return results;
}



// ============================================
// MASTER PROMPT GENERATION (STRICT)
// ============================================

export async function generateStrictMasterPrompt(
    category: string,
    masterPrompt: string
): Promise<string> {
    const prompt = `You are a professional review writer who creates authentic, human-like reviews.

BUSINESS CATEGORY: "${category}"

USER'S MASTER INSTRUCTIONS:
${masterPrompt}

CRITICAL RULES YOU MUST FOLLOW:

1. STRICT ADHERENCE:
   - Follow ONLY the user's context, word limit, and instructions
   - Do NOT invent or add ANY information not provided
   - Do NOT mention services, features, or details not in the context
   - Write EXACTLY what is requested, nothing more

2. HUMAN-LIKE WRITING & VARIETY:
   - Write naturally as a real customer would
   - Use conversational tone and natural phrasing
   - Include minor imperfections (if appropriate) like casual language
   - Avoid AI-like patterns (no "delve", "realm", "tapestry", excessive adjectives)
   - VARY YOUR SENTENCE STRUCTURE. Do NOT start every review with the same phrase.
   - Use different adjectives and sentence lengths.
   - VARIATION SEED: ${Math.random()} (Use this to ensure unique output)

3. CONTENT RESTRICTIONS:
   - Do NOT add star ratings unless explicitly requested
   - Do NOT add marketing language or promotional tone
   - Do NOT use emojis unless specified in instructions
   - Do NOT include greetings, signatures, or extra formatting
   - Do NOT mention "I recommend" or "highly recommended" unless natural to context

4. OUTPUT FORMAT:
   - Output ONLY the review text
   - No quotation marks around the review
   - No explanations, notes, or meta-commentary
   - No preamble or postamble

5. LANGUAGE:
   - Default language: French (unless user specifies otherwise)
   - Use natural, region-appropriate vocabulary

6. AUTHENTICITY:
   - Write from genuine personal experience perspective
   - Include specific but not excessive details
   - Sound like a real person, not a bot

7. WORD COUNT ENFORCEMENT (HIGHEST PRIORITY):
   - You MUST respect the provided "Word Limit" range.
   - If the user asks for 50-100 words, the output MUST be between 50 and 100 words.
   - Do NOT write less than the minimum.
   - Do NOT write more than the maximum.
   - Count your words before outputting. If it is too short, expand on the details. If it is too long, condense it.
   - A range like "30-50 words" is a HARD CONSTRAINT.

NOW WRITE THE REVIEW:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                temperature: 0.95,  // Increased for more variety
                topP: 0.95,
                topK: 40
            },
        });

        let text = response.text?.trim() || "";

        // Clean up any wrapper quotes or formatting
        text = text.replace(/^["'«»『』「」]+|["'«»『』「」]+$/g, "");
        text = text.replace(/^\*\*Review:\*\*\s*/i, "");
        text = text.replace(/^Review:\s*/i, "");

        return text;
    } catch (error) {
        console.error("Strict Master Prompt generation error:", error);
        throw new Error("Failed to generate review from master prompt");
    }
}
