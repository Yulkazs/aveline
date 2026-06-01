import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/check-user?userId=…
 *
 * Internal-only endpoint called by middleware to verify a JWT subject
 * still corresponds to a real user in the database.
 *
 * Returns 200 if the user exists, 404 if not.
 * Rejects requests that don't carry the internal header.
 */
export async function GET(req: NextRequest) {
  // Only allow calls from our own middleware
  if (req.headers.get("x-internal-check") !== "1") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}