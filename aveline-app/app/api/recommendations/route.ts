import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/recommendations
 *
 * Returns non-dismissed recommendations for the authenticated user,
 * including full product data, sorted by score descending.
 */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const recommendations = await prisma.recommendation.findMany({
    where:   { userId: auth.sub, dismissed: false },
    orderBy: { score: "desc" },
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

  return NextResponse.json(recommendations);
}

/**
 * PATCH /api/recommendations
 *
 * Dismiss a recommendation so it no longer appears.
 * Body: { id: string }
 */
export async function PATCH(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };

  if (!id) return NextResponse.json({ message: "id is verplicht." }, { status: 400 });

  const rec = await prisma.recommendation.findUnique({ where: { id } });
  if (!rec || rec.userId !== auth.sub) {
    return NextResponse.json({ message: "Niet gevonden." }, { status: 404 });
  }

  await prisma.recommendation.update({
    where: { id },
    data:  { dismissed: true },
  });

  return NextResponse.json({ ok: true });
}