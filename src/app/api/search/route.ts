/**
 * GET /api/search?q=query
 * Global search across reviews, profiles, and clients
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(request);
    const rl = checkRateLimit(`search:${session.user.id}:${ip}`, 60, 60_000);
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const userId = session.user.id;
    const role = session.user.role;
    const clientId = session.user.clientId;
    const parentAdminId = session.user.parentAdminId;
    const effectiveAdminId = role === "ADMIN" ? userId : parentAdminId;

    try {
        const [reviews, profiles, clients] = await Promise.all([
            // Search reviews
            prisma.review.findMany({
                where: {
                    isArchived: false,
                    ...(role === "CLIENT"
                        ? { profile: { clientId: clientId! } }
                        : effectiveAdminId
                        ? { profile: { client: { userId: effectiveAdminId } } }
                        : {}),
                    OR: [
                        { reviewText: { contains: q, mode: "insensitive" } },
                        { emailUsed: { contains: q, mode: "insensitive" } },
                        { profile: { businessName: { contains: q, mode: "insensitive" } } },
                    ],
                },
                select: {
                    id: true,
                    status: true,
                    reviewText: true,
                    emailUsed: true,
                    profile: { select: { businessName: true } },
                },
                take: 5,
            }),

            // Search profiles
            prisma.gmbProfile.findMany({
                where: {
                    isArchived: false,
                    ...(role === "CLIENT"
                        ? { clientId: clientId! }
                        : effectiveAdminId
                        ? { client: { userId: effectiveAdminId } }
                        : {}),
                    OR: [
                        { businessName: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    businessName: true,
                    category: true,
                    client: { select: { name: true } },
                },
                take: 5,
            }),

            // Search clients (admin only)
            role === "ADMIN" ? prisma.client.findMany({
                where: {
                    isArchived: false,
                    userId: userId,
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { email: { contains: q, mode: "insensitive" } },
                        { phone: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
                take: 5,
            }) : Promise.resolve([]),
        ]);

        const results = [
            ...reviews.map(r => ({
                type: "review" as const,
                id: r.id,
                title: r.reviewText?.slice(0, 60) || "Review",
                subtitle: r.profile.businessName,
                badge: r.status,
                url: `/reviews`,
            })),
            ...(profiles as any[]).map((p: any) => ({
                type: "profile" as const,
                id: p.id,
                title: p.businessName,
                subtitle: p.client?.name || "",
                badge: p.category || undefined,
                url: `/profiles/${p.id}`,
            })),
            ...(clients as any[]).map((c: any) => ({
                type: "client" as const,
                id: c.id,
                title: c.name,
                subtitle: c.email || c.phone || "",
                badge: undefined,
                url: `/clients/${c.id}`,
            })),
        ];

        return NextResponse.json({ results, query: q });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
