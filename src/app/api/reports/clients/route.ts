/**
 * Client Performance Ranking API
 * GET /api/reports/clients
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const scope = await getClientScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const startDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 30);
    const endDate = to ? endOfDay(new Date(to)) : new Date();

    // Get all reviews grouped by client
    const reviews = await prisma.review.findMany({
      where: {
        isArchived: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        profile: {
          client: scope.isAdmin
            ? { userId: scope.userId }
            : { id: scope.clientId! },
        },
      },
      select: {
        id: true,
        status: true,
        profile: {
          select: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by client and calculate stats
    const clientStats: Record<
      string,
      { id: string; name: string; totalReviews: number; liveReviews: number; doneReviews: number }
    > = {};

    reviews.forEach((review) => {
      const clientId = review.profile.client.id;
      const clientName = review.profile.client.name;

      if (!clientStats[clientId]) {
        clientStats[clientId] = {
          id: clientId,
          name: clientName,
          totalReviews: 0,
          liveReviews: 0,
          doneReviews: 0,
        };
      }

      clientStats[clientId].totalReviews++;
      if (review.status === "LIVE") {
        clientStats[clientId].liveReviews++;
      } else if (review.status === "DONE") {
        clientStats[clientId].doneReviews++;
      }
    });

    // Calculate success rate and format
    const clientRankings = Object.values(clientStats)
      .map((client) => ({
        id: client.id,
        name: client.name,
        totalReviews: client.totalReviews,
        liveReviews: client.liveReviews,
        doneReviews: client.doneReviews,
        successRate:
          client.totalReviews > 0
            ? Math.round(((client.liveReviews + client.doneReviews) / client.totalReviews) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalReviews - a.totalReviews) // Sort by total reviews
      .slice(0, 10); // Top 10

    return NextResponse.json(clientRankings);
  } catch (error) {
    console.error("Client rankings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client rankings" },
      { status: 500 }
    );
  }
}
