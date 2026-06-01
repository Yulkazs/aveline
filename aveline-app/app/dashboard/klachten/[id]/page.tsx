import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KlachtDetail from "@/components/dashboard/klachten/KlachtDetail";

export const dynamic = "force-dynamic";

export default async function KlachtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  // Rol altijd uit de DB halen — JWT kan verouderd zijn.
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });

  if (!dbUser) redirect("/login");

  if (!["CUSTOMER_SERVICE", "ADMIN"].includes(dbUser.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      user:          { select: { id: true, firstName: true, lastName: true, email: true, points: true } },
      product:       { select: { name: true, batchNumber: true, origin: true, cacaoPercentage: true } },
      statusHistory: { orderBy: { changedAt: "desc" } },
      crmNotes:      { orderBy: { createdAt: "desc" }, select: { id: true, content: true, createdBy: true, createdAt: true } },
    },
  });

  if (!complaint) notFound();

  return <KlachtDetail complaint={complaint} />;
}