import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PresentatieBeheer from "@/components/presentatie/PresentatieBeheer";

export const dynamic = "force-dynamic";

export default async function PresentatiePage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  if (auth.role !== "ADMIN") redirect("/dashboard");

  const rawSessions = await prisma.presentationSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        select: { id: true, username: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 10,
  });

  // Serialiseer Date objecten naar strings voor de client component
  const sessions = rawSessions.map((s) => ({
    ...s,
    createdAt:    s.createdAt.toISOString(),
    updatedAt:    s.updatedAt.toISOString(),
    participants: s.participants.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  return <PresentatieBeheer initialSessions={sessions} />;
}