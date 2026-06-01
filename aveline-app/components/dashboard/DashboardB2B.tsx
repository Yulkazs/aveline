"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, BookOpen, BarChart2, ChevronRight, Settings } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

type Props = { firstName: string };

export default function DashboardB2B({ firstName }: Props) {
  const router = useRouter();

  const TILES = [
    { label: "Catalogus",    href: "/dashboard/catalogus",  icon: BookOpen,     bg: "#EFF5EE" },
    { label: "Bestellingen", href: "/dashboard/orders",     icon: ShoppingCart, bg: "#E8F2E8" },
    { label: "Analytics",    href: "/dashboard/analytics",  icon: BarChart2,    bg: "#EFF5EE" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
              Hallo, {firstName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Welkom terug!</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => router.push("/dashboard/instellingen")}
              className="p-2 rounded-full"
              style={{ background: "#f5f8f5" }}
              aria-label="Instellingen"
            >
              <Settings size={20} color="#304C3A" />
            </button>
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 mt-2" style={{ color: "#7a8f82" }}>
          Snelle acties
        </h2>

        <div className="flex flex-col gap-3">
          {TILES.map(({ label, href, icon: Icon, bg }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[0.99] transition-transform"
              style={{ background: bg }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(48,76,58,0.12)" }}
              >
                <Icon size={22} color="#304C3A" strokeWidth={1.5} />
              </div>
              <span className="font-medium text-sm flex-1" style={{ color: "#122A1A" }}>{label}</span>
              <ChevronRight size={16} color="#BDD2B7" />
            </button>
          ))}
        </div>

        <div className="mt-7">
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Recente bestellingen</h2>
          <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#f5f8f5" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "#304C3A" }}>Geen bestellingen</p>
            <p className="text-xs" style={{ color: "#9aada2" }}>Bestellingen verschijnen hier zodra je bestelt</p>
          </div>
        </div>
      </div>
    </div>
  );
}