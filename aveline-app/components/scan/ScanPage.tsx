"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Zap, ZapOff, Image } from "lucide-react";
import ScannerView from "./ScannerView";
import ProductQuickview from "./ProductQuickview";

type ScannedProduct = {
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

export default function ScanPage() {
  const router = useRouter();
  const [torch, setTorch] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [gamification, setGamification] = useState<GamificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = useCallback(async (productId: string) => {
    setScanning(false);
    setError(null);

    try {
      const res = await fetch("/api/products/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Scan mislukt. Probeer opnieuw.");
        setScanning(true);
        return;
      }

      setScannedProduct(data.product);
      setGamification(data.gamification ?? null);
    } catch {
      setError("Er ging iets mis. Controleer je verbinding.");
      setScanning(true);
    }
  }, []);

  function handleCloseQuickview() {
    setScannedProduct(null);
    setGamification(null);
    setScanning(true);
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header overlay */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4 absolute top-0 left-0 right-0 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)" }}
          aria-label="Terug"
        >
          <ChevronLeft size={20} color="#ffffff" />
        </button>

        <h1 className="font-display text-lg font-semibold text-white">
          Product scannen
        </h1>

        <button
          onClick={() => setTorch((t) => !t)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.15)" }}
          aria-label="Zaklamp aan/uit"
        >
          {torch ? (
            <Zap size={18} color="#F59E0B" />
          ) : (
            <ZapOff size={18} color="#ffffff" />
          )}
        </button>
      </div>

      {/* Camera / scanner */}
      <div className="flex-1 relative">
        <ScannerView active={scanning} torch={torch} onScan={handleScan} />
      </div>

      {/* Bottom bar */}
      <div
        className="flex-shrink-0 flex flex-col items-center gap-4 px-6 pb-10 pt-6 absolute bottom-0 left-0 right-0 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
      >
        {error && (
          <p
            className="text-sm text-center px-4 py-2 rounded-full"
            style={{ background: "rgba(220,38,38,0.85)", color: "#fff" }}
          >
            {error}
          </p>
        )}

        <p className="text-sm text-white text-center" style={{ opacity: 0.7 }}>
          Richt de camera op de QR-code of barcode van het product
        </p>

        <button
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <Image size={16} />
          Kies uit galerij
        </button>
      </div>

      {/* Quickview sheet */}
      {scannedProduct && (
        <ProductQuickview
          product={scannedProduct}
          gamification={gamification}
          onClose={handleCloseQuickview}
        />
      )}
    </div>
  );
}
