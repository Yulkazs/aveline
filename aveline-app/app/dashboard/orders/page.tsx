import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BestelDetail from "@/components/dashboard/bestellingen/BestelDetail";

export const dynamic = "force-dynamic";

export default async function BestelDetailPage({
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

  if (!dbUser) redirect("/login");

  if (!["B2B_CLIENT", "ADMIN"].includes(dbUser.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              batchNumber: true,
              imageUrl: true,
              cacaoPercentage: true,
              origin: true,
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  // B2B klant mag alleen zijn eigen orders zien
  const isAdmin = dbUser.role === "ADMIN";
  if (!isAdmin && order!.userId !== auth.sub) {
    redirect("/dashboard/orders");
  }

  return (
    <BestelDetail
      order={JSON.parse(JSON.stringify(order))}
    />
  );
}