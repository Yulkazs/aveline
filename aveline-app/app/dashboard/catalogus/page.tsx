import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CatalogusClient from "@/components/dashboard/catalogus/CatalogusClient";

export const dynamic = "force-dynamic";

export default async function CatalogusPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "B2B_CLIENT") redirect("/dashboard");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercentage: true,
      origin: true,
      certifications: true,
      isLimitedEdition: true,
      isPremium: true,
      imageUrl: true,
      category: true,
      batchNumber: true,
    },
    orderBy: { name: "asc" },
  });

  // Unieke categorieën voor filter
  const categories = [...new Set(
    products.map((p) => p.category).filter(Boolean) as string[]
  )].sort();

  return (
    <CatalogusClient
      products={JSON.parse(JSON.stringify(products))}
      categories={categories}
    />
  );
}