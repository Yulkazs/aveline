"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, MapPin, Percent, Sparkles } from "lucide-react";

type Product = {
  id: string;
  name: string;
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

export default function AanbevelingenWidget() {
  const router = useRouter();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/recommendations")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Recommendation[]) => setRecs(data.slice(0, 3)))
      .catch(() => setRecs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDismiss(e: React.MouseEvent, recId: string) {
    e.stopPropagation();
    setRecs((prev) => prev.filter((r) => r.id !== recId));
    await fetch("/api/recommendations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recId }),
    }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>
            Aanbevolen voor jou
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-44 h-48 rounded-2xl"
              style={{ background: "#EFF5EE", opacity: 0.5 + i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} color="#304C3A" strokeWidth={1.75} />
          <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>
            Aanbevolen voor jou
          </h2>
        </div>
        <button
          onClick={() => router.push("/dashboard/aanbevelingen")}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: "#304C3A" }}
        >
          Alles <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory">
        {recs.map((rec) => (
          <button
            key={rec.id}
            onClick={() => router.push(`/dashboard/producten/${rec.product.id}`)}
            className="flex-shrink-0 w-44 rounded-2xl p-3.5 text-left flex flex-col gap-2 snap-start relative transition-opacity active:opacity-70"
            style={{ background: "#ffffff" }}
          >
            {/* Dismiss */}
            <button
              onClick={(e) => handleDismiss(e, rec.id)}
              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(154,173,162,0.2)" }}
              aria-label="Verwijderen"
            >
              <X size={10} color="#7a8f82" />
            </button>

            {/* Image / placeholder */}
            <div
              className="w-full h-24 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: "#EFF5EE" }}
            >
              {rec.product.imageUrl ? (
                <img
                  src={rec.product.imageUrl}
                  alt={rec.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl select-none">🍫</span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-1 flex-wrap">
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

            {/* Name */}
            <p
              className="text-sm font-semibold leading-snug line-clamp-2"
              style={{ color: "#122A1A" }}
            >
              {rec.product.name}
            </p>

            {/* Meta */}
            <div className="flex flex-col gap-1">
              {rec.product.origin && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                  <MapPin size={9} />
                  {rec.product.origin}
                </span>
              )}
              {rec.product.cacaoPercentage != null && (
                <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                  <Percent size={9} />
                  {rec.product.cacaoPercentage}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}