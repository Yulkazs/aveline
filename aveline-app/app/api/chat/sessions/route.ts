import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/chat/sessions ──────────────────────────────────────────────────
   B2C_CLIENT:       returns their own sessions
   CUSTOMER_SERVICE / ADMIN: returns all active sessions              */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role);

  const sessions = await prisma.chatSession.findMany({
    where: isStaff ? {} : { userId: auth.sub },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          points: true,
          _count: {
            select: { scans: true, communityPosts: true, complaints: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // only last message for preview
      },
    },
    orderBy: [
      { isActive: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(sessions);
}

/* ── POST /api/chat/sessions ─────────────────────────────────────────────────
   B2C client starts a new chat session.                               */
export async function POST() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  if (!["B2C_CLIENT", "ADMIN"].includes(auth.role)) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  // Check if there's already an active session for this user
  const existing = await prisma.chatSession.findFirst({
    where: { userId: auth.sub, isActive: true },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ ok: true, sessionId: existing.id, existing: true });
  }

  const session = await prisma.chatSession.create({
    data: { userId: auth.sub },
    select: { id: true },
  });

  // Create welcome message from bot
  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      senderType: "bot",
      content:
        "Hallo! Ik ben de Avéline assistent. Waarmee kan ik je helpen vandaag? Een medewerker pakt je gesprek zo snel mogelijk op.",
    },
  });

  // Notify all customer service staff
  const csStaff = await prisma.user.findMany({
    where: { role: "CUSTOMER_SERVICE" },
    select: { id: true },
  });

  if (csStaff.length > 0) {
    await prisma.notification.createMany({
      data: csStaff.map((u) => ({
        userId: u.id,
        type: "COMPLAINT_UPDATE" as const,
        title: "Nieuwe chat gestart",
        body: "Een klant wacht op ondersteuning via de live chat.",
        deepLink: `/dashboard/chat/${session.id}`,
      })),
    });
  }

  return NextResponse.json({ ok: true, sessionId: session.id, existing: false }, { status: 201 });
}