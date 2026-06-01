import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/* ── PATCH /api/marketing/promoties/[id] ─────────────────────────────────────
   Update status (e.g. schedule → send, draft → scheduled).               */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (!["MARKETING", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, sentAt } = body as { status?: string; sentAt?: string };

  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) {
    return NextResponse.json({ message: "Promotie niet gevonden." }, { status: 404 });
  }

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      ...(status ? { status: status as "DRAFT" | "SCHEDULED" | "SENT" } : {}),
      ...(sentAt ? { sentAt: new Date(sentAt) } : {}),
    },
  });

  return NextResponse.json({ ok: true, promotion: updated });
}

/* ── DELETE /api/marketing/promoties/[id] ────────────────────────────────────
   Hard-delete a promotion (draft only).                                   */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (!["MARKETING", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { id } = await params;

  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) {
    return NextResponse.json({ message: "Promotie niet gevonden." }, { status: 404 });
  }

  if (promotion.status === "SENT") {
    return NextResponse.json({ message: "Verstuurde promoties kunnen niet verwijderd worden." }, { status: 400 });
  }

  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}