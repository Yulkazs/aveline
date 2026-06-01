import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "E-mailadres en wachtwoord zijn verplicht." },
        { status: 400 }
      );
    }

    /* ── Look up user ─────────────────────────────────────────────── */
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Use constant-time comparison even when user not found
    const dummyHash = "$2a$12$invalidhashfortimingprotection000000000000000000000";
    const hashToCheck = user?.passwordHash ?? dummyHash;
    const valid = await bcrypt.compare(password, hashToCheck);

    if (!user || !valid) {
      return NextResponse.json(
        { message: "Onjuist e-mailadres of wachtwoord." },
        { status: 401 }
      );
    }

    /* ── Issue JWT ────────────────────────────────────────────────── */
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const { passwordHash: _pw, ...safeUser } = user;

    const response = NextResponse.json({ ok: true, user: safeUser });
    response.cookies.set("aveline_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { message: "Interne serverfout. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}