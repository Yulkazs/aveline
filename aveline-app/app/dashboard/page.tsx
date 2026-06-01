import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardB2C from "@/components/dashboard/DashboardB2C";
import DashboardB2B from "@/components/dashboard/DashboardB2B";
import DashboardCustomerService from "@/components/dashboard/DashboardCustomerService";
import DashboardMarketing from "@/components/dashboard/DashboardMarketing";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { firstName: true, lastName: true, email: true, role: true, points: true },
  });

  if (!user) redirect("/login");

  const firstName = user.firstName ?? user.email.split("@")[0];

  switch (user.role) {
    case "B2C_CLIENT":
      return <DashboardB2C firstName={firstName} points={user.points} />;

    case "B2B_CLIENT":
      return <DashboardB2B firstName={firstName} />;

    case "CUSTOMER_SERVICE": {
      const [openComplaints, activeChats] = await Promise.all([
        prisma.complaint.count({ where: { status: "NEW" } }),
        prisma.chatSession.count({ where: { isActive: true } }),
      ]);
      return (
        <DashboardCustomerService
          firstName={firstName}
          openComplaints={openComplaints}
          activeChats={activeChats}
        />
      );
    }

    case "MARKETING":
      return <DashboardMarketing firstName={firstName} />;

    case "ADMIN":
    default:
      return <DashboardB2C firstName={firstName} points={user.points} />;
  }
}