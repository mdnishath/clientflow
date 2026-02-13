import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
    getHumanLikePrompt,
    postProcessReview,
    HumanPromptConfig,
} from "@/lib/human-review-generator";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface DualGenerateBody {
    profileId: string;
    userHint?: string;
    usePromptPriority?: boolean;
    templateId?: string | null;
    category?: string;
}

/**
 * Map business category to context category for better matching
 * e.g., "Roofing Contractor" → "SERVICE", "Pizza Shop" → "RESTAURANT"
 */
type ContextCategory = "RESTAURANT" | "SERVICE" | "RETAIL" | "MEDICAL" | "GENERAL";

function mapToContextCategory(businessCategory: string): ContextCategory {
    const lower = businessCategory.toLowerCase();

    // Restaurant/Food related
    if (
        lower.includes("restaurant") ||
        lower.includes("food") ||
        lower.includes("cafe") ||
        lower.includes("coffee") ||
        lower.includes("pizza") ||
        lower.includes("bar") ||
        lower.includes("bakery") ||
        lower.includes("bistro") ||
        lower.includes("grill") ||
        lower.includes("diner") ||
        lower.includes("cuisine")
    ) {
        return "RESTAURANT";
    }

    // Service/Contractor related
    if (
        lower.includes("service") ||
        lower.includes("plumb") ||
        lower.includes("electric") ||
        lower.includes("salon") ||
        lower.includes("repair") ||
        lower.includes("contractor") ||
        lower.includes("roofing") ||
        lower.includes("hvac") ||
        lower.includes("cleaning") ||
        lower.includes("landscap") ||
        lower.includes("moving") ||
        lower.includes("paint") ||
        lower.includes("garage") ||
        lower.includes("mechanic") ||
        lower.includes("auto") ||
        lower.includes("construction") ||
        lower.includes("handyman") ||
        lower.includes("install") ||
        lower.includes("maintenance") ||
        lower.includes("spa") ||
        lower.includes("massage") ||
        lower.includes("barber") ||
        lower.includes("beauty")
    ) {
        return "SERVICE";
    }

    // Retail/Shop related
    if (
        lower.includes("shop") ||
        lower.includes("store") ||
        lower.includes("retail") ||
        lower.includes("boutique") ||
        lower.includes("market") ||
        lower.includes("supermarket") ||
        lower.includes("pharmacy") ||
        lower.includes("clothing") ||
        lower.includes("furniture") ||
        lower.includes("electronics")
    ) {
        return "RETAIL";
    }

    // Medical/Health related
    if (
        lower.includes("doctor") ||
        lower.includes("dent") ||
        lower.includes("clinic") ||
        lower.includes("medical") ||
        lower.includes("health") ||
        lower.includes("hospital") ||
        lower.includes("therapy") ||
        lower.includes("chiro") ||
        lower.includes("optom") ||
        lower.includes("physio") ||
        lower.includes("veterinar")
    ) {
        return "MEDICAL";
    }

    return "GENERAL";
}

/**
 * Generate human-readable business type description
 */
function getBusinessTypeDescription(category: string): string {
    const lower = category.toLowerCase();

    // Try to extract meaningful description
    if (lower.includes("roofing")) return "a roofing contractor/service";
    if (lower.includes("plumb")) return "a plumbing service";
    if (lower.includes("electric")) return "an electrical service";
    if (lower.includes("hvac") || lower.includes("heating") || lower.includes("cooling")) return "an HVAC/heating & cooling service";
    if (lower.includes("landscap") || lower.includes("lawn")) return "a landscaping/lawn care service";
    if (lower.includes("cleaning")) return "a cleaning service";
    if (lower.includes("moving")) return "a moving company";
    if (lower.includes("paint")) return "a painting service";
    if (lower.includes("construction")) return "a construction company";
    if (lower.includes("garage") || lower.includes("auto") || lower.includes("mechanic")) return "an auto repair/mechanic shop";
    if (lower.includes("salon") || lower.includes("hair") || lower.includes("beauty")) return "a hair/beauty salon";
    if (lower.includes("spa") || lower.includes("massage")) return "a spa/massage center";
    if (lower.includes("barber")) return "a barber shop";
    if (lower.includes("restaurant")) return "a restaurant";
    if (lower.includes("pizza")) return "a pizza restaurant";
    if (lower.includes("cafe") || lower.includes("coffee")) return "a café/coffee shop";
    if (lower.includes("bakery")) return "a bakery";
    if (lower.includes("dental") || lower.includes("dentist")) return "a dental clinic";
    if (lower.includes("clinic") || lower.includes("medical") || lower.includes("doctor")) return "a medical clinic";
    if (lower.includes("veterinar") || lower.includes("pet")) return "a veterinary clinic/pet service";

    // If no specific match, use the category name
    if (category && category !== "GENERAL") {
        return `a ${category.toLowerCase()} business`;
    }

    // Try to infer from business name
    return "this business";
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: DualGenerateBody = await request.json();
        const { profileId, userHint, templateId, category } = body;

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
        }

        // Fetch profile
        const profile = await prisma.gmbProfile.findFirst({
            where: {
                id: profileId,
                client: { userId: session.user.id },
            },
            select: {
                id: true,
                businessName: true,
                category: true,
            },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const businessCategory = category || profile.category || "GENERAL";
        const contextCategory = mapToContextCategory(businessCategory);
        const businessTypeDesc = getBusinessTypeDescription(businessCategory);

        let prompt: string;
        let templateInfo: { id: string; name: string; lines: number } | null = null;

        // Fetch template from database (optional - for tracking usage)
        let template;

        if (templateId) {
            template = await prisma.reviewTemplate.findFirst({
                where: { id: templateId, userId: session.user.id, isActive: true },
            });
        }

        if (!template) {
            const templates = await prisma.reviewTemplate.findMany({
                where: {
                    userId: session.user.id,
                    isActive: true,
                    OR: [
                        { category: businessCategory },
                        { category: contextCategory },
                        { category: "GENERAL" },
                        { category: null },
                    ],
                },
            });

            if (templates.length > 0) {
                // Prefer category-matched templates
                const matched = templates.filter(
                    t => t.category === businessCategory || t.category === contextCategory
                );
                template = matched.length > 0
                    ? matched[Math.floor(Math.random() * matched.length)]
                    : templates[Math.floor(Math.random() * templates.length)];
            }
        }

        // Build human-like prompt config
        const humanConfig: HumanPromptConfig = {
            businessName: profile.businessName,
            businessType: businessTypeDesc,
            businessCategory: businessCategory,
            userHint: userHint,
            templateInstruction: template?.promptInstruction?.replace(
                /\{businessName\}/g,
                profile.businessName
            ),
        };

        // Generate French
        let french = "";

        // CHECK: If no template and we have userHint, use STRICT MASTER PROMPT mode
        if (!templateId && userHint) {
            console.log("Using Strict Master Prompt Mode");
            // Import dynamically to avoid circular deps if any (though strict prompt is in gemini.ts)
            const { generateStrictMasterPrompt } = await import("@/lib/gemini");
            french = await generateStrictMasterPrompt(businessCategory, userHint, profile.businessName);
        } else {
            // Use the anti-AI detection prompt system
            prompt = getHumanLikePrompt(humanConfig);

            // Track template usage
            if (template) {
                templateInfo = { id: template.id, name: template.name, lines: template.lines };
                await prisma.reviewTemplate.update({
                    where: { id: template.id },
                    data: { usageCount: { increment: 1 } },
                });
            } else {
                templateInfo = { id: "human-like", name: "Anti-AI Human Style", lines: 2 };
            }

            const frenchResponse = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: { temperature: 0.85 + Math.random() * 0.1 },
            });

            french = frenchResponse.text?.trim() || "";
            // Apply anti-AI post-processing for more human-like output
            french = postProcessReview(french);
        }

        // Translate to Bangla
        const translatePrompt = `Translate to Bangla (বাংলা): "${french}"
Only output the Bangla translation. Keep it natural.`;

        const banglaResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: translatePrompt,
            config: { temperature: 0.5 },
        });

        let bangla = banglaResponse.text?.trim() || "";
        bangla = bangla.replace(/^["'«»]|["'«»]$/g, "");

        return NextResponse.json({
            success: true,
            french,
            bangla,
            profileId: profile.id,
            template: templateInfo,
            category: businessCategory,
            contextCategory,
        });
    } catch (error) {
        console.error("Dual generate error:", error);
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
