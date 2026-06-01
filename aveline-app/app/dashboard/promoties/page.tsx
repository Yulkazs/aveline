import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PromotiesClient from "@/components/dashboard/marketing/PromotiesClient";

export const dynamic = "force-dynamic";

export default async function PromotiesPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser) redirect("/login");

  if (!["MARKETING", "ADMIN"].includes(dbUser.role)) {
    redirect("/dashboard");
  }

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PromotiesClient promotions={promotions} />;
}