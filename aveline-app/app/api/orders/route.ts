import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/orders ──────────────────────────────────────────────────────── */
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

/* ── POST /api/orders ─────────────────────────────────────────────────────────
   Body: {
     deliveryAddress: string
     expectedDelivery?: string   (ISO date)
     items: { productId: string; quantity: number; unitPrice: number }[]
   }
   Alleen toegankelijk voor B2B_CLIENT.                                  */
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });
  if (auth.role !== "B2B_CLIENT") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Ongeldige body." }, { status: 400 });
  }

  const { deliveryAddress, expectedDelivery, items } = body as {
    deliveryAddress?: string;
    expectedDelivery?: string;
    items?: { productId: string; quantity: number; unitPrice: number }[];
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ message: "Geen producten opgegeven." }, { status: 400 });
  }

  if (!deliveryAddress?.trim()) {
    return NextResponse.json({ message: "Afleveradres is verplicht." }, { status: 400 });
  }

  // Valideer dat alle producten bestaan
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ message: "Een of meer producten niet gevonden." }, { status: 400 });
  }

  // Bereken totaalbedrag
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Zoek het bedrijf van de gebruiker
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { companyId: true },
  });

  const order = await prisma.order.create({
    data: {
      userId:          auth.sub,
      companyId:       dbUser?.companyId ?? null,
      deliveryAddress: deliveryAddress.trim(),
      expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
      totalAmount,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity:  item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, batchNumber: true, imageUrl: true },
          },
        },
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}