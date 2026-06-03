import { redirect } from "next/navigation";
import { getPresentationAuth } from "@/lib/presentationAuth";
import { prisma } from "@/lib/prisma";
import PresentatieDashboard from "@/components/presentatie/PresentatieDashboard";

export const dynamic = "force-dynamic";

export default async function PresentatieDashboardPage() {
  const auth = await getPresentationAuth();
  if (!auth) redirect("/");

  // Verifieer of sessie nog actief is
  const session = await prisma.presentationSession.findUnique({
    where: { id: auth.sessionId },
    select: { status: true, code: true },
  });

  if (!session || session.status === "ENDED") {
    redirect(`/presentatie/${session?.code ?? ""}`);
  }

  // Haal echte data op voor alle rollen
  const [openComplaints, activeChats] = await Promise.all([
    prisma.complaint.count({ where: { status: "NEW" } }),
    prisma.chatSession.count({ where: { isActive: true } }),
  ]);

  return (
    <PresentatieDashboard
      username={auth.username}
      sessionCode={auth.sessionCode}
      openComplaints={openComplaints}
      activeChats={activeChats}
    />
  );
}