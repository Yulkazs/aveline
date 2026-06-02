import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NieuweBestellingClient from "@/components/dashboard/bestellingen/NieuweBestellingClient";

export const dynamic = "force-dynamic";

export default async function NieuweBestellingPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true, companyId: true },
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

  return (
    <NieuweBestellingClient
      products={JSON.parse(JSON.stringify(products))}
    />
  );
}