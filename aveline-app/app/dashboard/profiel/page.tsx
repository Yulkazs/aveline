import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfielClient from "@/components/dashboard/ProfielClient";

export default async function ProfielPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      points: true,
      createdAt: true,
      _count: {
        select: {
          scans: true,
          communityPosts: true,
          badges: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return <ProfielClient user={user} />;
}