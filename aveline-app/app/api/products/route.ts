import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products
 * Accessible by B2B_CLIENT only.
 * Query params: ?search=&category=
 */
export async function GET(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });
  if (auth.role !== "B2B_CLIENT") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   ?? "";
  const category = searchParams.get("category") ?? "";

  const products = await prisma.product.findMany({
    where: {
      ...(search ? {
        name: { contains: search, mode: "insensitive" },
      } : {}),
      ...(category ? { category } : {}),
    },
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercentage: true,
      origin: true,
      certifications: true,
      isLimitedEdition: true,
      isPremium: true,
      imageUrl: true,
      category: true,
      batchNumber: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}