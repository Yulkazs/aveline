import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PresentatieBeheer from "@/components/presentatie/PresentatieBeheer";

export const dynamic = "force-dynamic";

export default async function PresentatiePage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "ADMIN") redirect("/dashboard");

  const sessions = await prisma.presentationSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        select: { id: true, username: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 10,
  });

  return <PresentatieBeheer initialSessions={sessions} />;
}