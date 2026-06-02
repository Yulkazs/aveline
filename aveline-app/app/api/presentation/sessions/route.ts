import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits  = "23456789";
  const part1 = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");
  const part2 = Array.from({ length: 4 }, () =>
    digits[Math.floor(Math.random() * digits.length)]
  ).join("");
  return `${part1}-${part2}`;
}

// GET /api/presentation/sessions — admin: list all sessions
export async function GET() {
  const auth = await getAuth();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  const sessions = await prisma.presentationSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        select: { id: true, username: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(sessions);
}

// POST /api/presentation/sessions — admin: create new session
export async function POST() {
  const auth = await getAuth();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Geen toegang." }, { status: 403 });
  }

  // Generate unique code, retry on collision
  let code = generateCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.presentationSession.findUnique({ where: { code } });
    if (!exists) break;
    code = generateCode();
  }

  const session = await prisma.presentationSession.create({
    data: { code },
    include: { participants: true },
  });

  return NextResponse.json({ ok: true, session }, { status: 201 });
}