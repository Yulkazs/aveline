import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/notifications ──────────────────────────────────────────────────
   Returns all notifications for the logged-in user, newest first.          */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

/* ── POST /api/notifications/read ────────────────────────────────────────────
   Mark a single notification as read.
   Body: { id: string }                                                      */
export async function PATCH(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, readAll } = body as { id?: string; readAll?: boolean };

  if (readAll) {
    await prisma.notification.updateMany({
      where: { userId: auth.sub, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (!id) {
    return NextResponse.json({ message: "Geef een notificatie-id op." }, { status: 400 });
  }

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== auth.sub) {
    return NextResponse.json({ message: "Notificatie niet gevonden." }, { status: 404 });
  }

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}

/* ── DELETE /api/notifications ───────────────────────────────────────────────
   Delete a single notification.
   Body: { id: string }                                                      */
export async function DELETE(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };

  if (!id) {
    return NextResponse.json({ message: "Geef een notificatie-id op." }, { status: 400 });
  }

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== auth.sub) {
    return NextResponse.json({ message: "Notificatie niet gevonden." }, { status: 404 });
  }

  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}