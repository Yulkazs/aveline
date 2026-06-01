import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KlachtIndienen from "@/components/dashboard/klachten/KlachtIndienen";

export const dynamic = "force-dynamic";

export default async function KlachtIndienenPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  if (!["B2C_CLIENT", "ADMIN"].includes(auth.role)) redirect("/dashboard");

  const { productId } = await searchParams;
  if (!productId) redirect("/dashboard");

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, batchNumber: true },
  });

  if (!product) notFound();

  return <KlachtIndienen product={product} />;
}