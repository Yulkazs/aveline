import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KlachtenClient from "@/components/dashboard/klachten/KlachtenClient";

export const dynamic = "force-dynamic";

export default async function KlachtenPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  // Haal de rol op uit de DB — niet uit de JWT.
  // De JWT kan verouderd zijn als de rol na inloggen is gewijzigd.
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser) redirect("/login");

  const role = dbUser.role;

  if (!["CUSTOMER_SERVICE", "ADMIN"].includes(role)) {
    redirect("/dashboard");
  }

  const complaints = await prisma.complaint.findMany({
    include: {
      user:    { select: { firstName: true, lastName: true, email: true } },
      product: { select: { name: true, batchNumber: true } },
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" },
    ],
  });

  return <KlachtenClient complaints={complaints} />;
}