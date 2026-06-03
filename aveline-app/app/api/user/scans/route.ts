import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/scans
 *
 * Returns all product scans for the authenticated user,
 * including full product data, newest first.
 */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const scans = await prisma.productScan.findMany({
    where: { userId: auth.sub },
    orderBy: { scannedAt: "desc" },
    include: {
      product: {
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
      },
    },
  });

  return NextResponse.json(scans);
}