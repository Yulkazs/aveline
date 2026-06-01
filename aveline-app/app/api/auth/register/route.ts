import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    /* ── Basic validation ─────────────────────────────────────────── */
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Alle velden zijn verplicht." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Wachtwoord moet minimaal 8 tekens bevatten." },
        { status: 400 }
      );
    }

    /* ── Check for existing account ───────────────────────────────── */
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Er bestaat al een account met dit e-mailadres." },
        { status: 409 }
      );
    }

    /* ── Split name into first / last ─────────────────────────────── */
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || null;

    /* ── Hash password & create user ──────────────────────────────── */
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

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

    /* ── Set cookie ───────────────────────────────────────────────── */
    const response = NextResponse.json({ ok: true, user }, { status: 201 });
    response.cookies.set("aveline_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { message: "Interne serverfout. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}