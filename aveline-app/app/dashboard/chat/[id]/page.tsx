import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatSessieB2C from "@/components/dashboard/chat/ChatSessieB2C";
import ChatSessieCS from "@/components/dashboard/chat/ChatSessieCS";

export const dynamic = "force-dynamic";

export default async function ChatSessiePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });
  if (!dbUser) redirect("/login");

  const { role } = dbUser;

  // Verify the session exists
  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!session) notFound();

  // B2C can only access their own sessions
  const isStaff = ["CUSTOMER_SERVICE", "ADMIN"].includes(role);
  if (!isStaff && session.userId !== auth.sub) {
    redirect("/dashboard/chat");
  }

  if (role === "B2C_CLIENT" || (!isStaff && role === "ADMIN")) {
    return <ChatSessieB2C sessionId={id} />;
  }

  if (role === "CUSTOMER_SERVICE" || (role === "ADMIN" && isStaff)) {
    return <ChatSessieCS sessionId={id} />;
  }

  redirect("/dashboard");
}