import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "@/components/dashboard/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "B2B_CLIENT") redirect("/dashboard");

  // Alle orders met items ophalen — filtering gebeurt client-side per periode
  const orders = await prisma.order.findMany({
    where: {
      userId: auth.sub,
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AnalyticsClient orders={JSON.parse(JSON.stringify(orders))} />
  );
}