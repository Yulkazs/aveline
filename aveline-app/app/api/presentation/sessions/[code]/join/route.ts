import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signPresentationToken } from "@/lib/presentationAuth";

type Params = { params: Promise<{ code: string }> };

// POST /api/presentation/sessions/[code]/join
export async function POST(req: NextRequest, { params }: Params) {
  const { code } = await params;

  const session = await prisma.presentationSession.findUnique({
    where: { code },
    select: { id: true, code: true, status: true },
  });

  if (!session) {
    return NextResponse.json({ message: "Sessie niet gevonden." }, { status: 404 });
  }

  if (session.status === "ENDED") {
    return NextResponse.json({ message: "Deze sessie is al afgelopen." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { username } = body as { username?: string };

  if (!username?.trim() || username.trim().length < 2) {
    return NextResponse.json(
      { message: "Gebruikersnaam moet minimaal 2 tekens bevatten." },
      { status: 400 }
    );
  }

  if (username.trim().length > 20) {
    return NextResponse.json(
      { message: "Gebruikersnaam mag maximaal 20 tekens bevatten." },
      { status: 400 }
    );
  }

  // Check if username already taken in this session
  const taken = await prisma.presentationParticipant.findFirst({
    where: {
      sessionId: session.id,
      username: { equals: username.trim(), mode: "insensitive" },
    },
  });

  if (taken) {
    return NextResponse.json(
      { message: "Deze gebruikersnaam is al bezet in deze sessie." },
      { status: 409 }
    );
  }

  // Register participant
  const participant = await prisma.presentationParticipant.create({
    data: { sessionId: session.id, username: username.trim() },
  });

  // Issue presentation JWT
  const token = await signPresentationToken({
    sessionId:     session.id,
    sessionCode:   session.code,
    username:      participant.username,
    participantId: participant.id,
  });

  const response = NextResponse.json({
    ok: true,
    username: participant.username,
    sessionStatus: session.status,
  });

  response.cookies.set("aveline_presentation_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 uur
    path: "/",
  });

  return response;
}