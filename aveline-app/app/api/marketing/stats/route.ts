import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";

// ── GET /api/marketing/stats ──────────────────────────────────────────────────
export async function GET() {
  const auth = await getAuth();
  if (!auth) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const now = new Date();

  const [
    activePromotions,
    scheduledPromotions,
    sentPromotionsThisMonth,
    plannedNotifications,
    totalCommunityPosts,
    communityPostsThisWeek,
    totalCommunityComments,
    recentPromotions,
    upcomingNotifications,
    recentPosts,
  ] = await Promise.all([
    // Active = SCHEDULED with scheduledAt in the future, or no scheduledAt
    prisma.promotion.count({
      where: { status: "SCHEDULED" },
    }),

    // Scheduled but not yet sent
    prisma.promotion.count({
      where: { status: "SCHEDULED", scheduledAt: { gt: now } },
    }),

    // Sent this calendar month
    prisma.promotion.count({
      where: {
        status: "SENT",
        sentAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    }),

    // Upcoming planned notifications (not cancelled, in the future)
    prisma.plannedNotification.count({
      where: {
        isCancelled: false,
        scheduledAt: { gt: now },
      },
    }),

    // Total community posts (not hidden)
    prisma.communityPost.count({
      where: { isHidden: false },
    }),

    // Community posts this week
    prisma.communityPost.count({
      where: {
        isHidden: false,
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Total comments
    prisma.communityComment.count(),

    // 5 most recent promotions for the feed
    prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        targetSegment: true,
        scheduledAt: true,
        sentAt: true,
        createdAt: true,
        discountCode: true,
      },
    }),

    // Next 3 upcoming planned notifications
    prisma.plannedNotification.findMany({
      where: { isCancelled: false, scheduledAt: { gt: now } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        body: true,
        targetSegment: true,
        scheduledAt: true,
      },
    }),

    // 3 most recent community posts for a quick view
    prisma.communityPost.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return NextResponse.json({
    promotions: {
      active: activePromotions,
      scheduled: scheduledPromotions,
      sentThisMonth: sentPromotionsThisMonth,
      recent: recentPromotions.map((p) => ({
        ...p,
        scheduledAt: p.scheduledAt?.toISOString() ?? null,
        sentAt: p.sentAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      })),
    },
    notifications: {
      upcoming: plannedNotifications,
      next: upcomingNotifications.map((n) => ({
        ...n,
        scheduledAt: n.scheduledAt.toISOString(),
      })),
    },
    community: {
      totalPosts: totalCommunityPosts,
      postsThisWeek: communityPostsThisWeek,
      totalComments: totalCommunityComments,
      recentPosts: recentPosts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    },
  });
}