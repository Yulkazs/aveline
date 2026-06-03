// app/recepten/[slug]/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import ReceptDetail from "@/components/recepten/ReceptDetail";

async function getRecept(slug: string) {
  // Next.js 15: cookies() is async
  const cookieStore = await cookies();
  const token = cookieStore.get("aveline_token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/recepten/${slug}`,
    {
      headers: {
        ...(token ? { Cookie: `aveline_token=${token}` } : {}),
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) return { type: "not_found" as const };
  if (res.status === 403) {
    const data = await res.json();
    return { type: "premium" as const, preview: data.preview };
  }

  const data = await res.json();
  return { type: "ok" as const, recept: data.recept };
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