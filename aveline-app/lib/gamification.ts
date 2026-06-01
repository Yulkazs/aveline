import { prisma } from "@/lib/prisma";
import type { BadgeType as PrismaBadgeType } from "@/app/generated/prisma/client";

/* ─── Point values per action ─────────────────────────────────────────────── */
export const POINTS: Record<string, number> = {
  SCAN:            10,
  COMPLAINT:        5,
  COMMUNITY_POST:   5,
  COMMUNITY_REPLY:  2,
};

/* ─── Badge unlock rules ──────────────────────────────────────────────────── */
const BADGE_TYPES = [
  "FIRST_SCAN",
  "FIRST_COMPLAINT",
  "FIRST_POST",
  "LOYAL_CUSTOMER",
  "COMMUNITY_STAR",
  "PRODUCT_EXPLORER",
] as const;

export type BadgeType = (typeof BADGE_TYPES)[number];

type BadgeRule = {
  type: BadgeType;
  name: string;
  description: string;
  check: (userId: string) => Promise<boolean>;
};

export const BADGE_RULES: BadgeRule[] = [
  {
    type:        "FIRST_SCAN",
    name:        "Eerste scan",
    description: "Je hebt je eerste product gescand!",
    check: async (userId) => {
      const count = await prisma.productScan.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type:        "FIRST_COMPLAINT",
    name:        "Eerste klacht",
    description: "Je hebt je eerste klacht ingediend.",
    check: async (userId) => {
      const count = await prisma.complaint.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type:        "FIRST_POST",
    name:        "Community starter",
    description: "Je hebt je eerste community bericht geplaatst!",
    check: async (userId) => {
      const count = await prisma.communityPost.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type:        "PRODUCT_EXPLORER",
    name:        "Product explorer",
    description: "Je hebt 10 producten gescand — een echte chocolade-expert!",
    check: async (userId) => {
      const count = await prisma.productScan.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    type:        "COMMUNITY_STAR",
    name:        "Community ster",
    description: "Je hebt 5 berichten geplaatst in de community.",
    check: async (userId) => {
      const count = await prisma.communityPost.count({ where: { userId } });
      return count >= 5;
    },
  },
  {
    type:        "LOYAL_CUSTOMER",
    name:        "Trouwe klant",
    description: "Je account bestaat al meer dan 30 dagen.",
    check: async (userId) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });
      if (!user) return false;
      const days = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return days >= 30;
    },
  },
];

/* ─── Ensure badge definitions exist in DB ───────────────────────────────── */
export async function seedBadges() {
  for (const rule of BADGE_RULES) {
    await prisma.badge.upsert({
      where:  { type: rule.type as PrismaBadgeType },
      update: { name: rule.name, description: rule.description },
      create: { type: rule.type as PrismaBadgeType, name: rule.name, description: rule.description },
    });
  }
}

/* ─── Core: award points + check badges ──────────────────────────────────── */
export type GamificationAction = keyof typeof POINTS;

export type GamificationResult = {
  pointsAdded: number;
  newTotal: number;
  badgesEarned: Array<{ type: string; name: string; description: string }>;
};

export async function awardPoints(
  userId: string,
  action: GamificationAction
): Promise<GamificationResult> {
  const pts = POINTS[action] ?? 0;

  // 1. Add points atomically
  const updated = await prisma.user.update({
    where: { id: userId },
    data:  { points: { increment: pts } },
    select: { points: true },
  });

  // 2. Make sure all badge definitions exist
  await seedBadges();

  // 3. Fetch badges the user already has
  const existing = await prisma.userBadge.findMany({
    where:  { userId },
    select: { badge: { select: { type: true } } },
  });
  const ownedTypes = new Set(existing.map((ub) => ub.badge.type));

  // 4. Check every rule; award any newly unlocked badges
  const earned: GamificationResult["badgesEarned"] = [];

  for (const rule of BADGE_RULES) {
    if (ownedTypes.has(rule.type)) continue;

    const unlocked = await rule.check(userId);
    if (!unlocked) continue;

    const badge = await prisma.badge.upsert({
      where:  { type: rule.type as PrismaBadgeType },
      update: {},
      create: { type: rule.type as PrismaBadgeType, name: rule.name, description: rule.description },
    });

    await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
    });

    await prisma.notification.create({
      data: {
        userId,
        type:  "BADGE_EARNED",
        title: `🏅 Badge verdiend: ${rule.name}`,
        body:  rule.description,
      },
    });

    earned.push({ type: rule.type, name: rule.name, description: rule.description });
  }

  return {
    pointsAdded: pts,
    newTotal:    updated.points,
    badgesEarned: earned,
  };
}