import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/orders/[id] ────────────────────────────────────────────────────
   Returns full order detail with items and product info.               */
export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const isAdmin = auth.role === "ADMIN";
  const isB2B   = auth.role === "B2B_CLIENT";

  if (!isAdmin && !isB2B) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              batchNumber: true,
              imageUrl: true,
              cacaoPercentage: true,
              origin: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Bestelling niet gevonden." }, { status: 404 });
  }

  // B2B klant mag alleen zijn eigen orders zien
  if (!isAdmin && order.userId !== auth.sub) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  return NextResponse.json(order);
}