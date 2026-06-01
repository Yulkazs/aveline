import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/orders ─────────────────────────────────────────────────────────
   B2B_CLIENT: returns their own orders
   ADMIN:      returns all orders                                        */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const isAdmin = auth.role === "ADMIN";
  const isB2B   = auth.role === "B2B_CLIENT";

  if (!isAdmin && !isB2B) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: auth.sub },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              batchNumber: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}