// app/dashboard/orders/page.tsx
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BestellingenClient from "@/components/dashboard/bestellingen/BestellingenClient";

export const dynamic = "force-dynamic";

export default async function BestellingenPage() {
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

  const isAdmin = dbUser.role === "ADMIN";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: auth.sub },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              batchNumber: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <BestellingenClient
      orders={JSON.parse(JSON.stringify(orders))}
    />
  );
}