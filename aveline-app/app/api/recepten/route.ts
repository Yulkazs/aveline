// app/api/recepten/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("aveline_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// ContentItem.body is opgeslagen als JSON-string met het volgende formaat:
// {
//   subtitle: string
//   duur: number          // minuten
//   porties: number
//   teaser: string
//   intro: string
//   certificeringen: string[]
//   ingredienten: { amount: string; unit: string; name: string }[]
//   stappen: { nummer: number; titel: string; beschrijving: string; duur?: number }[]
//   tip?: string
//   videoUrl?: string
//   posterUrl?: string    // pad naar marketing-afbeelding
//   productSlug?: string
//   productName?: string
// }
//
// difficulty  → ContentItem.difficulty  ("makkelijk" | "gemiddeld" | "moeilijk")
// flavor      → ContentItem.flavor
// slug        → afgeleid van ContentItem.title (slugify)

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── GET /api/recepten ────────────────────────────────────────────────────────
//
// Query params:
//   zoek          string   – doorzoekt title
//   smaak         string   – filtert op flavor
//   moeilijkheid  string   – filtert op difficulty
//
// Response (altijd):
//   { recepten: ReceptCard[] }
//
// ReceptCard bevat NOOIT body/stappen voor premium items als gast.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const zoek = searchParams.get("zoek") ?? "";
  const smaak = searchParams.get("smaak") ?? "";
  const moeilijkheid = searchParams.get("moeilijkheid") ?? "";

  const authenticated = await isAuthenticated(req);

  try {
    const items = await prisma.contentItem.findMany({
      where: {
        type: "RECIPE",
        status: { in: ["ACTIVE", "NEW"] },
        ...(zoek && {
          title: { contains: zoek, mode: "insensitive" },
        }),
        ...(smaak && { flavor: smaak }),
        ...(moeilijkheid && { difficulty: moeilijkheid }),
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        flavor: true,
        isPremium: true,
        imageUrl: true,
        body: true, // bevat subtitle, duur, teaser, posterUrl etc.
      },
      orderBy: [
        { isPremium: "asc" }, // publieke recepten eerst
        { createdAt: "desc" },
      ],
    });

    const recepten = items.map((item) => {
      const meta = safeParseBody(item.body);

      // Premium + niet ingelogd: geef alleen de kaartinfo terug, geen inhoud
      if (item.isPremium && !authenticated) {
        return {
          id: item.id,
          slug: slugify(item.title),
          title: item.title,
          subtitle: meta.subtitle ?? null,
          difficulty: item.difficulty,
          flavor: item.flavor,
          duur: meta.duur ?? null,
          isPremium: true,
          imageUrl: item.imageUrl,
          posterUrl: meta.posterUrl ?? null,
          product: meta.productName ?? null,
          teaser: meta.teaser ?? null,
          // Inhoud achtergehouden
          ingredienten: null,
          stappen: null,
          intro: null,
        };
      }

      return {
        id: item.id,
        slug: slugify(item.title),
        title: item.title,
        subtitle: meta.subtitle ?? null,
        difficulty: item.difficulty,
        flavor: item.flavor,
        duur: meta.duur ?? null,
        isPremium: item.isPremium,
        imageUrl: item.imageUrl,
        posterUrl: meta.posterUrl ?? null,
        product: meta.productName ?? null,
        teaser: meta.teaser ?? null,
      };
    });

    return NextResponse.json({ recepten });
  } catch (error) {
    console.error("[GET /api/recepten]", error);
    return NextResponse.json(
      { error: "Kon recepten niet ophalen." },
      { status: 500 }
    );
  }
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function safeParseBody(body: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}