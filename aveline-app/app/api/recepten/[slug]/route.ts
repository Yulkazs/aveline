// app/api/recepten/[slug]/route.ts
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safeParseBody(body: string | null): Record<string, unknown> {
  if (!body) return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ─── GET /api/recepten/[slug] ─────────────────────────────────────────────────
//
// Geeft het volledige recept terug, inclusief stappen en ingrediënten.
// Premium recepten worden geblokkeerd voor niet-ingelogde gebruikers:
//   → 403 { error: "premium", message: "..." }
//
// De client (ReceptDetail) leest de 403 en toont de PremiumWall.

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const authenticated = await isAuthenticated(req);

  try {
    // We slaan geen slug op in de DB — haal alle recepten op en match op slugify(title).
    // Voor grotere datasets: sla slug op als apart veld in ContentItem.
    const items = await prisma.contentItem.findMany({
      where: {
        type: "RECIPE",
        status: { in: ["ACTIVE", "NEW"] },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            cacaoPercentage: true,
            origin: true,
            certifications: true,
          },
        },
      },
    });

    const item = items.find((i) => slugify(i.title) === slug);

    if (!item) {
      return NextResponse.json(
        { error: "Recept niet gevonden." },
        { status: 404 }
      );
    }

    // Premium blokkade
    if (item.isPremium && !authenticated) {
      const meta = safeParseBody(item.body);
      return NextResponse.json(
        {
          error: "premium",
          message: "Dit recept is alleen beschikbaar voor ingelogde gebruikers.",
          // Geef genoeg info mee om de PremiumWall te renderen
          preview: {
            id: item.id,
            slug,
            title: item.title,
            subtitle: meta.subtitle ?? null,
            teaser: meta.teaser ?? null,
            imageUrl: item.imageUrl,
            posterUrl: meta.posterUrl ?? null,
            isPremium: true,
          },
        },
        { status: 403 }
      );
    }

    // Volledig recept
    const meta = safeParseBody(item.body);

    const recept = {
      id: item.id,
      slug,
      title: item.title,
      subtitle: meta.subtitle ?? null,
      difficulty: item.difficulty,
      flavor: item.flavor,
      duur: meta.duur ?? null,
      porties: meta.porties ?? 4,
      isPremium: item.isPremium,
      imageUrl: item.imageUrl,
      posterUrl: meta.posterUrl ?? null,
      intro: meta.intro ?? null,
      teaser: meta.teaser ?? null,
      tip: meta.tip ?? null,
      videoUrl: item.videoUrl ?? null,
      certificeringen: item.product?.certifications ?? [],
      ingredienten: meta.ingredienten ?? [],
      stappen: meta.stappen ?? [],
      // Productinfo voor de "gebruikte chocolade" sectie
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            slug: slugify(item.product.name),
            imageUrl: item.product.imageUrl,
            cacaoPercentage: item.product.cacaoPercentage,
            origin: item.product.origin,
          }
        : null,
    };

    return NextResponse.json({ recept });
  } catch (error) {
    console.error(`[GET /api/recepten/${slug}]`, error);
    return NextResponse.json(
      { error: "Kon recept niet ophalen." },
      { status: 500 }
    );
  }
}