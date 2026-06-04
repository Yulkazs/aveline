import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { getPresentationAuth } from "@/lib/presentationAuth";

// ── GET /api/marketing/stats ──────────────────────────────────────────────────
export async function GET() {
  // Normale auth check
  const auth = await getAuth();

  // Presentatie-deelnemers mogen ook lezen
  const presentationAuth = !auth ? await getPresentationAuth() : null;

  if (!auth && !presentationAuth) {
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
    prisma.promotion.count({
      where: { status: "SCHEDULED" },
    }),
    prisma.promotion.count({
      where: { status: "SCHEDULED", scheduledAt: { gt: now } },
    }),
    prisma.promotion.count({
      where: {
        status: "SENT",
        sentAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    }),
    prisma.plannedNotification.count({
      where: {
        isCancelled: false,
        scheduledAt: { gt: now },
      },
    }),
    prisma.communityPost.count({
      where: { isHidden: false },
    }),
    prisma.communityPost.count({
      where: {
        isHidden: false,
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.communityComment.count(),
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
        sentAt:      p.sentAt?.toISOString() ?? null,
        createdAt:   p.createdAt.toISOString(),
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
      totalPosts:     totalCommunityPosts,
      postsThisWeek:  communityPostsThisWeek,
      totalComments:  totalCommunityComments,
      recentPosts:    recentPosts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    },
  });
}