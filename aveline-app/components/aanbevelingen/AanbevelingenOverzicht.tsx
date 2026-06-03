"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, MapPin, Percent, Award, Sparkles } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  cacaoPercentage: number | null;
  origin: string | null;
  certifications: string[];
  isLimitedEdition: boolean;
  isPremium: boolean;
  imageUrl: string | null;
  category: string | null;
};

type Recommendation = {
  id: string;
  score: number;
  reason: string | null;
  product: Product;
};

export default function AanbevelingenOverzicht() {
  const router = useRouter();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/recommendations")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Recommendation[]) => setRecs(data))
      .catch(() => setRecs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDismiss(recId: string) {
    setDismissing((prev) => new Set(prev).add(recId));

    await fetch("/api/recommendations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recId }),
    }).catch(() => {});

    // Brief animation delay before removing from list
    setTimeout(() => {
      setRecs((prev) => prev.filter((r) => r.id !== recId));
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(recId);
        return next;
      });
    }, 250);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#F5F8F5" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5" style={{ background: "#ffffff" }}>
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#EFF5EE" }}
            aria-label="Terug"
          >
            <ChevronLeft size={20} color="#304C3A" />
          </button>
          <h1
            className="font-display text-[1.75rem] font-semibold leading-tight"
            style={{ color: "#122A1A" }}
          >
            Aanbevelingen
          </h1>
        </div>
        <p className="text-sm pl-12" style={{ color: "#7a8f82" }}>
          {loading
            ? "Laden…"
            : recs.length > 0
            ? `${recs.length} product${recs.length !== 1 ? "en" : ""} voor jou geselecteerd`
            : "Geen aanbevelingen op dit moment"}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Loading skeletons */}
        {loading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full h-24 rounded-2xl"
                style={{
                  background: "#ffffff",
                  opacity: 1 - i * 0.15,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && recs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-6">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <Sparkles size={28} color="#304C3A" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#122A1A" }}>
                Nog geen aanbevelingen
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
                Scan meer producten zodat we jouw smaakprofiel beter leren kennen.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/scan")}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "#304C3A" }}
            >
              Product scannen
            </button>
          </div>
        )}

        {/* Recommendation cards */}
        {!loading && recs.map((rec) => (
          <div
            key={rec.id}
            className="transition-all duration-200"
            style={{
              opacity: dismissing.has(rec.id) ? 0 : 1,
              transform: dismissing.has(rec.id) ? "translateX(20px)" : "none",
            }}
          >
            <button
              onClick={() => router.push(`/dashboard/producten/${rec.product.id}`)}
              className="w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-opacity active:opacity-70"
              style={{ background: "#ffffff" }}
            >
              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: "#EFF5EE" }}
              >
                {rec.product.imageUrl ? (
                  <img
                    src={rec.product.imageUrl}
                    alt={rec.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl select-none">🍫</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex gap-1.5 mb-1 flex-wrap">
                  {rec.product.isPremium && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(202,138,4,0.12)", color: "#92400E" }}
                    >
                      Premium
                    </span>
                  )}
                  {rec.product.isLimitedEdition && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(147,51,234,0.1)", color: "#6B21A8" }}
                    >
                      Limited
                    </span>
                  )}
                </div>

                <p
                  className="font-semibold text-sm leading-snug truncate"
                  style={{ color: "#122A1A" }}
                >
                  {rec.product.name}
                </p>

                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {rec.product.origin && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                      <MapPin size={10} />
                      {rec.product.origin}
                    </span>
                  )}
                  {rec.product.cacaoPercentage != null && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                      <Percent size={10} />
                      {rec.product.cacaoPercentage}%
                    </span>
                  )}
                  {rec.product.certifications.length > 0 && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                      <Award size={10} />
                      {rec.product.certifications[0]}
                    </span>
                  )}
                </div>

                {/* Reason chip */}
                {rec.reason && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Sparkles size={10} color="#304C3A" />
                    <p
                      className="text-[10px] leading-snug line-clamp-1"
                      style={{ color: "#7a8f82" }}
                    >
                      {rec.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(rec.id);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-1"
                style={{ background: "#F5F8F5" }}
                aria-label="Verwijder aanbeveling"
              >
                <X size={13} color="#9aada2" />
              </button>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}