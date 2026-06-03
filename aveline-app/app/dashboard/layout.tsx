import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";
import IdleGuard from "@/components/IdleGuard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  // ── Admin: geen BottomNav, geen IdleGuard, geen mobile-shell ──────────────
  // Admin heeft maar één pagina (/dashboard/presentatie) en heeft
  // geen navigatie of idle-timeout nodig.
  if (auth.role === "ADMIN") {
    return (
      <div className="mobile-shell">
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    );
  }

  // ── Alle andere rollen: normale layout met BottomNav ───────────────────────
  return (
    <div className="mobile-shell">
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>
      <BottomNavWrapper initialRole={auth.role} />
      <IdleGuard />
    </div>
  );
}