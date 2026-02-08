import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    generateBatchReviews,
    generateBatchAdvancedReviews,
    AdvancedReviewOptions,
    TargetLanguage
} from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

interface GenerateRequestBody {
    profileId?: string;
    profileIds?: string[];
    quantity?: number;
    style?: string;
    // V2 Options
    useAdvanced?: boolean;
    language?: TargetLanguage;
    userHint?: string;
}

interface ProfileData {
    id: string;
    businessName: string;
    category: string | null;
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: GenerateRequestBody = await request.json();
        const {
            profileId,
            profileIds,
            quantity = 1,
            style = "detailed",
            useAdvanced = false,
            language = "french",
            userHint
        } = body;

        // Support both single profileId with quantity, and array of profileIds
        let targetProfileIds: string[] = [];

        if (profileId) {
            // Single profile with quantity - repeat for batch generation
            targetProfileIds = Array(Math.min(quantity, 50)).fill(profileId); // Increased limit to 50
        } else if (profileIds && Array.isArray(profileIds)) {
            targetProfileIds = profileIds;
        }

        if (targetProfileIds.length === 0) {
            return NextResponse.json(
                { error: "Profile ID or Profile IDs are required" },
                { status: 400 }
            );
        }

        // Get unique profile IDs for fetching
        const uniqueProfileIds = [...new Set(targetProfileIds)];

        // Fetch profiles with explicit type
        const profiles: ProfileData[] = await prisma.gmbProfile.findMany({
            where: {
                id: { in: uniqueProfileIds },
                client: { userId: session.user.id },
            },
            select: {
                id: true,
                businessName: true,
                category: true,
            },
        });

        if (profiles.length === 0) {
            return NextResponse.json(
                { error: "No valid profiles found" },
                { status: 404 }
            );
        }

        // Build lookup map
        const profileMap = new Map<string, ProfileData>(profiles.map(p => [p.id, p]));

        // Get the first profile for advanced generation (single profile batch)
        const primaryProfile = profileMap.get(targetProfileIds[0]);
        if (!primaryProfile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        let generatedReviews: string[] = [];

        if (useAdvanced) {
            // ============================================
            // V2: Advanced Generation with Personas
            // ============================================
            const advancedOpts: AdvancedReviewOptions = {
                businessName: primaryProfile.businessName,
                businessCategory: mapCategoryToEnum(primaryProfile.category),
                language: language,
                userHint: userHint,
            };

            generatedReviews = await generateBatchAdvancedReviews(advancedOpts, quantity);
        } else {
            // ============================================
            // Legacy Generation
            // ============================================
            const generationOptions = targetProfileIds.map(id => {
                const profile = profileMap.get(id)!;
                return {
                    businessName: profile.businessName,
                    category: profile.category || "Business",
                    style: style as "detailed" | "short" | "enthusiastic",
                };
            });

            generatedReviews = await generateBatchReviews(generationOptions);
        }

        // Optional: Auto-save to database (can be toggled by client)
        const autoSave = body.profileId ? false : true; // Only auto-save for multiple profiles

        if (autoSave && targetProfileIds.length === generatedReviews.length) {
            const createdReviews = await Promise.all(
                generatedReviews.map((reviewText, index) => {
                    const profileIdForReview = targetProfileIds[index];
                    return prisma.review.create({
                        data: {
                            user: { connect: { id: session.user.id } },
                            profile: { connect: { id: profileIdForReview } },
                            reviewText,
                            status: "PENDING",
                            notes: useAdvanced ? `AI V2 (${language})` : `AI (${style})`,
                            dueDate: new Date(),
                        },
                    });
                })
            );

            return NextResponse.json({
                success: true,
                count: createdReviews.length,
                reviews: createdReviews,
                texts: generatedReviews,
            });
        }

        // Return generated texts without saving
        return NextResponse.json({
            success: true,
            count: generatedReviews.length,
            texts: generatedReviews,
        });

    } catch (error) {
        console.error("Error batch generating reviews:", error);
        return NextResponse.json(
            { error: "Failed to generate reviews" },
            { status: 500 }
        );
    }
}

/**
 * Map free-text category to enum
 */
function mapCategoryToEnum(category: string | null): AdvancedReviewOptions["businessCategory"] {
    if (!category) return "GENERAL";

    const lower = category.toLowerCase();

    if (lower.includes("restaurant") || lower.includes("food") || lower.includes("cafe") || lower.includes("pizza") || lower.includes("bar")) {
        return "RESTAURANT";
    }
    if (lower.includes("service") || lower.includes("plumb") || lower.includes("electric") || lower.includes("salon") || lower.includes("repair")) {
        return "SERVICE";
    }
    if (lower.includes("shop") || lower.includes("store") || lower.includes("retail") || lower.includes("boutique")) {
        return "RETAIL";
    }
    if (lower.includes("doctor") || lower.includes("dent") || lower.includes("clinic") || lower.includes("medical") || lower.includes("health")) {
        return "MEDICAL";
    }

    return "GENERAL";
}
