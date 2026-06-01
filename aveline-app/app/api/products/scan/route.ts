import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/gamification";

/**
 * POST /api/products/scan
 *
 * Registers a product scan for the authenticated user (or as a guest).
 * Awards gamification points when the user is logged in.
 *
 * Body: { productId: string }
 *
 * Returns the scanned product plus gamification results.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { productId } = body as { productId?: string };

  if (!productId) {
    return NextResponse.json({ message: "productId is verplicht." }, { status: 400 });
  }

  // Verify the product exists
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

  // Auth is optional — guests can scan but don't earn points
  const auth = await getAuth().catch(() => null);

  // Record the scan (userId is null for guests)
  await prisma.productScan.create({
    data: {
      productId,
      userId: auth?.sub ?? null,
    },
  });

  // Award points only for logged-in users
  const gamification = auth
    ? await awardPoints(auth.sub, "SCAN").catch(() => null)
    : null;

  return NextResponse.json({ ok: true, product, gamification }, { status: 201 });
}
