import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";
import { generateRecommendations } from "@/lib/recommendations";

/**
 * POST /api/products/scan
 *
 * Registers a product scan for the authenticated user (or as a guest).
 * Awards gamification points and refreshes recommendations when logged in.
 *
 * Body: { productId: string }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { productId } = body as { productId?: string };

  if (!productId) {
    return NextResponse.json({ message: "productId is verplicht." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercentage: true,
      origin: true,
      ingredients: true,
      allergens: true,
      certifications: true,
      batchNumber: true,
      isLimitedEdition: true,
      isPremium: true,
      imageUrl: true,
      category: true,
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product niet gevonden." }, { status: 404 });
  }

  const auth = await getAuth().catch(() => null);

  await prisma.productScan.create({
    data: {
      productId,
      userId: auth?.sub ?? null,
    },
  });

  let gamification = null;
  if (auth) {
    // Run points + recommendations in parallel; neither blocks the response
    [gamification] = await Promise.all([
      awardPoints(auth.sub, "SCAN").catch(() => null),
      generateRecommendations(auth.sub).catch(() => null),
    ]);
  }

  return NextResponse.json({ ok: true, product, gamification }, { status: 201 });
}