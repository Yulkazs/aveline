"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ScanLine, Award, MapPin, Percent } from "lucide-react";

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
  batchNumber: string | null;
};

type Scan = {
  id: string;
  productId: string;
  scannedAt: string;
  product: Product;
};

export default function ProductenOverzicht() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/scans")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => setScans(data))
      .catch(() => setError("Kon producten niet laden."))
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate: one card per unique product, most-recently scanned first
  const seen = new Set<string>();
  const unique = scans.filter(({ productId }) => {
    if (seen.has(productId)) return false;
    seen.add(productId);
    return true;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: "#F5F8F5" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 pb-5" style={{ background: "#ffffff" }}>
        <h1
          className="font-display text-[1.75rem] font-semibold leading-tight"
          style={{ color: "#122A1A" }}
        >
          Mijn producten
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7a8f82" }}>
          {unique.length > 0
            ? `${unique.length} product${unique.length !== 1 ? "en" : ""} gescand`
            : "Nog geen producten gescand"}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-7 h-7 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "#51C675",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="text-sm" style={{ color: "#9aada2" }}>
              Laden…
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: "#FEE2E2", color: "#991B1B" }}
          >
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && unique.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-6">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "#EFF5EE" }}
            >
              <ScanLine size={28} color="#304C3A" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#122A1A" }}>
                Nog geen producten
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
                Scan een barcode of QR-code om je eerste product te registreren.
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

        {!loading && !error && unique.map(({ id, product, scannedAt }) => (
          <button
            key={id}
            onClick={() => router.push(`/dashboard/producten/${product.id}`)}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-opacity active:opacity-70"
            style={{ background: "#ffffff" }}
          >
            {/* Thumbnail */}
            <div
              className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{ background: "#EFF5EE" }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl select-none" style={{ filter: "grayscale(0.2)" }}>
                  🍫
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex gap-1.5 mb-1 flex-wrap">
                {product.isPremium && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(202,138,4,0.12)", color: "#92400E" }}
                  >
                    Premium
                  </span>
                )}
                {product.isLimitedEdition && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(147,51,234,0.1)", color: "#6B21A8" }}
                  >
                    Limited
                  </span>
                )}
              </div>

              <p className="font-semibold text-sm leading-snug truncate" style={{ color: "#122A1A" }}>
                {product.name}
              </p>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {product.origin && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                    <MapPin size={10} />
                    {product.origin}
                  </span>
                )}
                {product.cacaoPercentage != null && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                    <Percent size={10} />
                    {product.cacaoPercentage}% cacao
                  </span>
                )}
                {product.certifications.length > 0 && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#7a8f82" }}>
                    <Award size={10} />
                    {product.certifications[0]}
                  </span>
                )}
              </div>

              <p className="text-[10px] mt-1" style={{ color: "#b0bfb5" }}>
                Gescand op{" "}
                {new Date(scannedAt).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>

            <ChevronRight size={16} color="#9aada2" />
          </button>
        ))}
      </div>

      {/* FAB — scan button */}
      {!loading && unique.length > 0 && (
        <div className="flex-shrink-0 px-5 pb-6 pt-3">
          <button
            onClick={() => router.push("/dashboard/scan")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
            style={{ background: "#304C3A" }}
          >
            <ScanLine size={18} />
            Nieuw product scannen
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}