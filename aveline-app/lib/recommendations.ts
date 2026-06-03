import { prisma } from "@/lib/prisma";

/**
 * Generates (or refreshes) recommendations for a user after a scan.
 *
 * Logic:
 *  1. Look at all products the user has scanned.
 *  2. Find products they have NOT scanned, that share:
 *       - the same category, OR
 *       - the same origin
 *     with any of their scanned products.
 *  3. Score each candidate:
 *       +2 if category matches a scanned product
 *       +1 if origin matches a scanned product
 *       +1 per matching certification
 *  4. Upsert top 10 into the Recommendation table (skip already dismissed).
 */
export async function generateRecommendations(userId: string): Promise<void> {
  // ── 1. Fetch the user's scan history ───────────────────────────────────
  const scans = await prisma.productScan.findMany({
    where: { userId },
    select: {
      product: {
        select: {
          id: true,
          category: true,
          origin: true,
          certifications: true,
        },
      },
    },
  });

  if (scans.length === 0) return;

  const scannedIds   = new Set(scans.map((s) => s.product.id));
  const categories   = new Set(scans.map((s) => s.product.category).filter(Boolean) as string[]);
  const origins      = new Set(scans.map((s) => s.product.origin).filter(Boolean) as string[]);
  const certCounts   = new Map<string, number>();

  for (const scan of scans) {
    for (const cert of scan.product.certifications) {
      certCounts.set(cert, (certCounts.get(cert) ?? 0) + 1);
    }
  }

  // ── 2. Fetch already-dismissed recommendations ─────────────────────────
  const dismissed = await prisma.recommendation.findMany({
    where: { userId, dismissed: true },
    select: { productId: true },
  });
  const dismissedIds = new Set(dismissed.map((r) => r.productId));

  // ── 3. Find candidate products ─────────────────────────────────────────
  const candidates = await prisma.product.findMany({
    where: {
      id: { notIn: [...scannedIds, ...dismissedIds] },
      OR: [
        { category: { in: [...categories] } },
        { origin:   { in: [...origins]   } },
      ],
    },
    select: {
      id: true,
      category: true,
      origin: true,
      certifications: true,
    },
    take: 50,
  });

  if (candidates.length === 0) return;

  // ── 4. Score candidates ────────────────────────────────────────────────
  type Scored = { productId: string; score: number; reason: string };

  const scored: Scored[] = candidates.map((p) => {
    let score = 0;
    const reasons: string[] = [];

    if (p.category && categories.has(p.category)) {
      score += 2;
      reasons.push(`zelfde categorie (${p.category})`);
    }
    if (p.origin && origins.has(p.origin)) {
      score += 1;
      reasons.push(`zelfde herkomst (${p.origin})`);
    }
    for (const cert of p.certifications) {
      if (certCounts.has(cert)) {
        score += 1;
        reasons.push(`gedeeld keurmerk (${cert})`);
        break; // only count once per product
      }
    }

    const reason =
      reasons.length > 0
        ? `Aanbevolen op basis van: ${reasons.join(", ")}.`
        : "Past bij jouw smaakprofiel.";

    return { productId: p.id, score, reason };
  });

  // Sort descending, take top 10
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 10);

  // ── 5. Upsert recommendations ──────────────────────────────────────────
  await Promise.all(
    top.map(({ productId, score, reason }) =>
      prisma.recommendation.upsert({
        where:  { userId_productId: { userId, productId } },
        create: { userId, productId, score, reason },
        update: { score, reason },          // refresh score; don't touch dismissed
      })
    )
  );
}