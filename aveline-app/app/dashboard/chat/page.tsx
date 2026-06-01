import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatOverzichtB2C from "@/components/dashboard/chat/ChatOverzichtB2C";
import ChatOverzichtCS from "@/components/dashboard/chat/ChatOverzichtCS";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { role: true },
  });
  if (!dbUser) redirect("/login");

  const { role } = dbUser;

  if (role === "B2C_CLIENT" || role === "ADMIN") {
    return <ChatOverzichtB2C />;
  }

  if (role === "CUSTOMER_SERVICE") {
    return <ChatOverzichtCS />;
  }

  // B2B and MARKETING don't have access to this page
  redirect("/dashboard");
}