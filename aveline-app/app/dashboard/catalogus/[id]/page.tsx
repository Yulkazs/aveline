import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/dashboard/catalogus/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "B2B_CLIENT") redirect("/dashboard");

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      cacaoPercentage: true,
      origin: true,
      ingredients: true,
      allergens: true,
      certifications: true,
      batchNumber: true,
      isLimitedEdition: true,
      isPremium: true,
      imageUrl: true,
      category: true,
    },
  });

  if (!product) notFound();

  return <ProductDetail product={JSON.parse(JSON.stringify(product))} />;
}