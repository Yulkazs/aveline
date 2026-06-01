import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });

  const userBadges = await prisma.userBadge.findMany({
    where: { userId: auth.sub },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  return NextResponse.json(userBadges);
}