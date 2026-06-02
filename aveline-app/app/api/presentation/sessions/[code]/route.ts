import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ code: string }> };

// GET /api/presentation/sessions/[code] — public: poll status + participants
export async function GET(_req: NextRequest, { params }: Params) {
  const { code } = await params;

  const session = await prisma.presentationSession.findUnique({
    where: { code },
    include: {
      participants: {
        select: { id: true, username: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  return NextResponse.json(session);
}

// PATCH /api/presentation/sessions/[code] — admin: update status
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };

  if (!status || !["WAITING", "ACTIVE", "ENDED"].includes(status)) {
    return NextResponse.json({ message: "Ongeldige status." }, { status: 400 });
  }

  const session = await prisma.presentationSession.findUnique({ where: { code } });
  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  const updated = await prisma.presentationSession.update({
    where: { code },
    data: { status: status as "WAITING" | "ACTIVE" | "ENDED" },
    include: {
      participants: { select: { id: true, username: true, createdAt: true } },
    },
  });

  return NextResponse.json({ ok: true, session: updated });
}

// DELETE /api/presentation/sessions/[code] — admin: hard delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuth();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const { code } = await params;

  const session = await prisma.presentationSession.findUnique({ where: { code } });
  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  await prisma.presentationSession.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}