"use client";

import { useRouter } from "next/navigation";
import { QrCode, ChevronRight, Settings } from "lucide-react";
import NotificationBell from "@/components/dashboard/NotificationBell";
import AanbevelingenWidget from "@/components/aanbevelingen/AanbevelingenWidget";

type Props = { firstName: string; points: number };

export default function DashboardB2C({ firstName, points }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="font-display text-[1.75rem] font-semibold leading-tight"
              style={{ color: "#122A1A" }}
            >
              Hallo, {firstName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#7a8f82" }}>
              Welkom terug!
            </p>
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

      {/* ── Scrollable body ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">

        {/* Scan CTA */}
        <div className="mb-7 mt-1">
          <button
            onClick={() => router.push("/dashboard/scan")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-sm text-white"
            style={{ background: "#304C3A" }}
          >
            <QrCode size={18} strokeWidth={1.75} />
            Scan product
          </button>
        </div>

        {/* Aanbevelingen widget — renders nothing when no recommendations */}
        <AanbevelingenWidget />

        {/* Mijn Producten */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>
              Mijn Producten
            </h2>
            <button
              onClick={() => router.push("/dashboard/producten")}
              className="text-sm font-medium"
              style={{ color: "#304C3A" }}
            >
              Alles bekijken
            </button>
          </div>

          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center"
            style={{ background: "#f5f8f5" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "#e8f0e5" }}
            >
              <QrCode size={26} color="#304C3A" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#304C3A" }}>
              Nog geen producten
            </p>
            <p className="text-xs" style={{ color: "#9aada2" }}>
              Scan een QR-code om je eerste product te registreren
            </p>
          </div>
        </div>

        {/* Jouw Voortgang */}
        <div className="mt-7">
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>
            Jouw Voortgang
          </h2>
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: "#f5f8f5" }}
          >
            <div>
              <p className="text-xs mb-1" style={{ color: "#7a8f82" }}>
                Totaal punten
              </p>
              <p
                className="text-2xl font-semibold font-display"
                style={{ color: "#304C3A" }}
              >
                {points}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/profiel")}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "#304C3A" }}
            >
              Bekijk badges <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}