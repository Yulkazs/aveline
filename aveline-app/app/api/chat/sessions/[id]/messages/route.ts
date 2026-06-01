import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/chat/sessions/[id]/messages ────────────────────────────────────
   Returns all messages for a session.
   Supports ?after=<ISO timestamp> for polling only new messages.      */
export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role);

  // CS needs user info for the sidebar; B2C doesn't
  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      isActive: true,
      assignedAgent: true,
      rating: true,
      createdAt: true,
      ...(isStaff
        ? {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                points: true,
                _count: {
                  select: {
                    scans: true,
                    communityPosts: true,
                    complaints: true,
                  },
                },
              },
            },
          }
        : {}),
    },
  });

  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  // B2C can only access their own session
  if (!isStaff && session.userId !== auth.sub) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const after = req.nextUrl.searchParams.get("after");

  const messages = await prisma.chatMessage.findMany({
    where: {
      sessionId: id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages, session });
}

/* ── POST /api/chat/sessions/[id]/messages ───────────────────────────────────
   Send a message in a session.
   Body: { content: string }                                           */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;

  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: { id: true, userId: true, isActive: true },
  });

  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  if (!session.isActive) {
    return NextResponse.json({ message: "Dit gesprek is gesloten." }, { status: 400 });
  }

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role);
  if (!isStaff && session.userId !== auth.sub) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { content } = body as { content?: string };

  if (!content?.trim()) {
    return NextResponse.json({ message: "Bericht mag niet leeg zijn." }, { status: 400 });
  }

  const senderType = isStaff ? "agent" : "user";

  const message = await prisma.chatMessage.create({
    data: {
      sessionId: id,
      senderType,
      senderId: auth.sub,
      content: content.trim(),
    },
  });

  // If agent sends first message, assign them to the session
  if (isStaff) {
    await prisma.chatSession.update({
      where: { id },
      data: { assignedAgent: auth.sub },
    });

    // Notify the customer
    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "COMPLAINT_UPDATE" as const,
        title: "Medewerker heeft gereageerd",
        body: content.trim().slice(0, 80),
        deepLink: `/dashboard/chat/${id}`,
      },
    });
  }

  return NextResponse.json({ ok: true, message }, { status: 201 });
}

/* ── PATCH /api/chat/sessions/[id]/messages ──────────────────────────────────
   Close a session (staff or the customer themselves).
   Body: { rating?: number }                                           */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const { id } = await params;

  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role);
  if (!isStaff && session.userId !== auth.sub) {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { rating } = body as { rating?: number };

  await prisma.chatSession.update({
    where: { id },
    data: {
      isActive: false,
      closedAt: new Date(),
      ...(rating ? { rating } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}