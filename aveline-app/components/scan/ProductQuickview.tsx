"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Award, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  origin: string | null;
  cacaoPercentage: number | null;
  batchNumber: string | null;
  isPremium: boolean;
  isLimitedEdition: boolean;
  certifications: string[];
};

type GamificationResult = {
  pointsAdded: number;
  newTotal: number;
  badgesEarned: Array<{ name: string }>;
};

type Props = {
  product: Product;
  gamification: GamificationResult | null;
  onClose: () => void;
};

export default function ProductQuickview({ product, gamification, onClose }: Props) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl animate-fade-slide-up"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-2" style={{ background: "#e4e4e4" }} />

        {/* Close */}
        <div className="flex items-center justify-between px-5 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9aada2" }}>
            Product gevonden
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full"
            style={{ background: "#f5f8f5" }}
            aria-label="Sluiten"
          >
            <X size={14} color="#304C3A" />
          </button>
        </div>

        {/* Product card */}
        <div className="mx-5 mb-4 rounded-2xl p-4 flex items-center gap-4" style={{ background: "#EFF5EE" }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
            style={{ background: "rgba(48,76,58,0.12)" }}
          >
            🍫
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-1 flex-wrap">
              {product.isPremium && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(202,138,4,0.15)", color: "#92400E" }}
                >
                  Premium
                </span>
              )}
              {product.isLimitedEdition && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(147,51,234,0.12)", color: "#6B21A8" }}
                >
                  Limited Edition
                </span>
              )}
            </div>
            <p className="text-base font-semibold leading-snug" style={{ color: "#122A1A" }}>
              {product.name}
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              {product.origin && (
                <span className="text-xs" style={{ color: "#7a8f82" }}>
                  🌍 {product.origin}
                </span>
              )}
              {product.cacaoPercentage != null && (
                <span className="text-xs" style={{ color: "#7a8f82" }}>
                  🍫 {product.cacaoPercentage}% cacao
                </span>
              )}
              {product.batchNumber && (
                <span className="text-xs" style={{ color: "#7a8f82" }}>
                  Batch #{product.batchNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <div className="mx-5 mb-4 flex gap-2 flex-wrap">
            {product.certifications.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "#EFF5EE" }}
              >
                <Award size={11} color="#304C3A" />
                <span className="text-xs font-medium" style={{ color: "#304C3A" }}>
                  {cert}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Points earned */}
        {gamification && gamification.pointsAdded > 0 && (
          <div
            className="mx-5 mb-4 flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: "#304C3A" }}
          >
            <span className="text-2xl">⭐</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                +{gamification.pointsAdded} punten verdiend!
              </p>
              {gamification.badgesEarned.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "#BDD2B7" }}>
                  Nieuwe badge: {gamification.badgesEarned[0].name} 🏅
                </p>
              )}
              <p className="text-xs mt-0.5" style={{ color: "#BDD2B7" }}>
                Totaal: {gamification.newTotal} punten
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-5 pb-10 flex flex-col gap-3">
          <button
            onClick={() => router.push(`/scan/product/${product.id}`)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            Productinformatie bekijken
            <ChevronRight size={18} />
          </button>
          <button onClick={onClose} className="btn-secondary">
            Terug naar scanner
          </button>
        </div>
      </div>
    </div>
  );
}
