import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/products/[id]
 *
 * Returns full product detail. Accessible by guests and authenticated users.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
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

  return NextResponse.json(product);
}
