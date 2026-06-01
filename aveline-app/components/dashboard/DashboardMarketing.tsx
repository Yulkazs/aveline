"use client";

import { useRouter } from "next/navigation";
import { Megaphone, Users, ChevronRight, Settings } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";

type Props = { firstName: string };

export default function DashboardMarketing({ firstName }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
              Hallo, {firstName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>Marketing dashboard</p>
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
        <div className="grid grid-cols-2 gap-3 mb-7 mt-2">
          {[
            { label: "Actieve promoties", value: "—" },
            { label: "Community posts",   value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
              <p className="text-2xl font-semibold font-display" style={{ color: "#304C3A" }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#7a8f82" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: "Promoties beheren", href: "/dashboard/promoties", icon: Megaphone, bg: "#EFF5EE" },
            { label: "Community",         href: "/dashboard/community", icon: Users,     bg: "#E8F2E8" },
          ].map(({ label, href, icon: Icon, bg }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-4 p-4 rounded-2xl text-left"
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
      </div>
    </div>
  );
}