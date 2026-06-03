"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Wifi } from "lucide-react";

type Participant = { id: string; username: string; createdAt: string };

export default function WachtkamerPage() {
  const router = useRouter();
  const params = useParams();
  const code   = params.code as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dots, setDots]                 = useState(".");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated dots
  useEffect(() => {
    dotsRef.current = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => { if (dotsRef.current) clearInterval(dotsRef.current); };
  }, []);

  // Poll sessie status elke 2 seconden
  useEffect(() => {
    async function poll() {
      const res = await fetch(`/api/presentation/sessions/${code}`).catch(() => null);
      if (!res?.ok) return;
      const data = await res.json();

      setParticipants(data.participants ?? []);

      if (data.status === "ACTIVE") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        router.push("/presentatie/dashboard");
      }
    }

    poll();
    pollingRef.current = setInterval(poll, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [code, router]);

  return (
    <div className="mobile-shell">
      <div className="flex-shrink-0 px-6 pt-16 pb-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "#EFF5EE" }}
        >
          <span className="text-3xl">🍫</span>
        </div>

        <h1
          className="font-display text-2xl font-semibold mb-1"
          style={{ color: "#122A1A" }}
        >
          Wachtkamer
        </h1>
        <p className="text-sm mb-5" style={{ color: "#7a8f82" }}>
          Sessie{" "}
          <span className="font-mono font-semibold" style={{ color: "#304C3A" }}>
            {code}
          </span>
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "#FEF3C7" }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#F59E0B", animation: "pulse 1.5s infinite" }}
          />
          <span className="text-xs font-semibold" style={{ color: "#D97706" }}>
            Wachten op de presentator{dots}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#9aada2" }}
        >
          {participants.length} deelnemer{participants.length !== 1 ? "s" : ""} aanwezig
        </p>

        {participants.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "#f5f8f5" }}
          >
            <p className="text-sm" style={{ color: "#9aada2" }}>
              Jij bent de eerste!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "#f5f8f5" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "#BDD2B7", color: "#304C3A" }}
                >
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: "#122A1A" }}>
                  {p.username}
                </span>
                <Wifi size={12} color="#51C675" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-6 py-6 text-center">
        <p className="text-xs" style={{ color: "#BDD2B7" }}>
          De app start automatisch zodra de presentator begint.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}