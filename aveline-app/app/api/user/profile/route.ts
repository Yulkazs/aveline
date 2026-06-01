import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ── GET /api/user/profile ───────────────────────────────────────────────── */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          scans: true,
          communityPosts: true,
          badges: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ message: "Gebruiker niet gevonden." }, { status: 404 });
  return NextResponse.json(user);
}

/* ── PATCH /api/user/profile ─────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { firstName, lastName } = body as { firstName?: string; lastName?: string };

  // Only allow updating name fields
  const data: { firstName?: string; lastName?: string | null } = {};
  if (typeof firstName === "string") data.firstName = firstName.trim() || undefined;
  if (typeof lastName === "string")  data.lastName  = lastName.trim()  || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Geen wijzigingen opgegeven." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: auth.sub },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, points: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}