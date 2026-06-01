import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/marketing/promoties ────────────────────────────────────────────
   Returns all promotions, newest first.                                      */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (!["MARKETING", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(promotions);
}

/* ── POST /api/marketing/promoties ───────────────────────────────────────────
   Create a new promotion.
   Body: { title, body, imageUrl?, discountCode?, targetSegment?, scheduledAt? } */
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (!["MARKETING", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, body: promoBody, imageUrl, discountCode, targetSegment, scheduledAt, sendNow } = body as {
    title?: string;
    body?: string;
    imageUrl?: string;
    discountCode?: string;
    targetSegment?: string;
    scheduledAt?: string;
    sendNow?: boolean;
  };

  if (!title?.trim() || !promoBody?.trim()) {
    return NextResponse.json({ message: "Titel en tekst zijn verplicht." }, { status: 400 });
  }

  const status = sendNow ? "SENT" : scheduledAt ? "SCHEDULED" : "DRAFT";

  const promotion = await prisma.promotion.create({
    data: {
      title: title.trim(),
      body: promoBody.trim(),
      imageUrl: imageUrl?.trim() || null,
      discountCode: discountCode?.trim() || null,
      targetSegment: targetSegment || null,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      sentAt: sendNow ? new Date() : null,
      createdBy: auth.sub,
    },
  });

  // If sending now: push notifications to target users
  if (sendNow) {
    const roleMap: Record<string, string> = {
      b2c: "B2C_CLIENT",
      b2b: "B2B_CLIENT",
      all: "",
    };
    const targetRole = targetSegment ? roleMap[targetSegment] : "";

    const users = await prisma.user.findMany({
      where: targetRole ? { role: targetRole as "B2C_CLIENT" | "B2B_CLIENT" } : {},
      select: { id: true },
    });

    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type: "PROMOTION" as const,
          title: promotion.title,
          body: promotion.body.slice(0, 100),
          deepLink: `/dashboard/promoties/${promotion.id}`,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true, promotion }, { status: 201 });
}