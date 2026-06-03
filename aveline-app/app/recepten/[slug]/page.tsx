import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import ReceptDetail from "@/components/recepten/ReceptDetail";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

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
  try { return JSON.parse(body) as Record<string, unknown>; }
  catch { return {}; }
}

async function getRecept(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("aveline_token")?.value;

  let authenticated = false;
  if (token) {
    try { await jwtVerify(token, JWT_SECRET); authenticated = true; }
    catch { /* ongeldige token */ }
  }

  const items = await prisma.contentItem.findMany({
    where: { type: "RECIPE", status: { in: ["ACTIVE", "NEW"] } },
    include: {
      product: {
        select: {
          id: true, name: true, imageUrl: true,
          cacaoPercentage: true, origin: true, certifications: true,
        },
      },
    },
  });

  const item = items.find((i) => slugify(i.title) === slug);
  if (!item) return { type: "not_found" as const };

  if (item.isPremium && !authenticated) {
    const meta = safeParseBody(item.body);
    return {
      type: "premium" as const,
      preview: {
        id: item.id, slug,
        title: item.title,
        subtitle: meta.subtitle ?? null,
        teaser: meta.teaser ?? null,
        imageUrl: item.imageUrl,
        posterUrl: meta.posterUrl ?? null,
        isPremium: true,
      },
    };
  }

  const meta = safeParseBody(item.body);
  return {
    type: "ok" as const,
    recept: {
      id: item.id, slug,
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
      // ReceptDetail verwacht product als string en productSlug apart
      product: item.product?.name ?? (meta.productName as string) ?? null,
      productSlug: item.product
        ? slugify(item.product.name)
        : (meta.productSlug as string) ?? null,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getRecept(slug);
  if (result.type === "not_found")
    return { title: "Recept niet gevonden — Avéline" };
  const title =
    result.type === "premium" ? result.preview.title : result.recept.title;
  const description =
    result.type === "premium" ? result.preview.teaser : result.recept.teaser;
  return {
    title: `${title} — Avéline Recepten`,
    description,
  };
}

export default async function ReceptPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getRecept(slug);

  if (result.type === "not_found") notFound();

  if (result.type === "premium") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <ReceptDetail recept={{ ...result.preview, isPremium: true } as any} />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ReceptDetail recept={result.recept as any} />;
}