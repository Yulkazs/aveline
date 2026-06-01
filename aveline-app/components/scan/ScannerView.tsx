"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  active: boolean;
  torch: boolean;
  onScan: (productId: string) => void;
};

// Demo product IDs — in production these come from real QR scan results
const DEMO_PRODUCTS = [
  "prod_noir_85",
  "prod_lait_caramel",
  "prod_blanc_vanille",
  "prod_ruby_framboos",
];

export default function ScannerView({ active, onScan }: Props) {
  const [linePos, setLinePos] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scannedRef = useRef(false);

  // Animate scan line
  useEffect(() => {
    if (!active) return;
    animRef.current = setInterval(() => {
      setLinePos((p) => {
        const next = p + direction * 1.2;
        if (next >= 100) { setDirection(-1); return 100; }
        if (next <= 0)   { setDirection(1);  return 0;   }
        return next;
      });
    }, 16);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Simulate auto-scan after 3 seconds in demo mode
  useEffect(() => {
    if (!active || scannedRef.current) return;
    const t = setTimeout(() => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      const id = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
      onScan(id);
    }, 3000);
    return () => clearTimeout(t);
  }, [active, onScan]);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Simulated camera feed — dark with subtle noise */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      {/* Dark vignette overlay outside viewport */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />

      {/* Viewport cutout */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          width: "68%",
          aspectRatio: "1",
        }}
      >
        {/* Clear area */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.01)", boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
        >
          {/* Scan line */}
          {active && (
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${linePos}%`,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent 0%, #51C675 20%, #51C675 80%, transparent 100%)",
                boxShadow: "0 0 8px #51C675",
                transition: "top 16ms linear",
              }}
            />
          )}
        </div>

        {/* Corner markers */}
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div
            key={pos}
            className="absolute"
            style={{
              width: 22,
              height: 22,
              top:    pos.startsWith("t") ? -1 : undefined,
              bottom: pos.startsWith("b") ? -1 : undefined,
              left:   pos.endsWith("l")   ? -1 : undefined,
              right:  pos.endsWith("r")   ? -1 : undefined,
              borderTop:    pos.startsWith("t") ? "3px solid #51C675" : undefined,
              borderBottom: pos.startsWith("b") ? "3px solid #51C675" : undefined,
              borderLeft:   pos.endsWith("l")   ? "3px solid #51C675" : undefined,
              borderRight:  pos.endsWith("r")   ? "3px solid #51C675" : undefined,
              borderRadius:
                pos === "tl" ? "6px 0 0 0" :
                pos === "tr" ? "0 6px 0 0" :
                pos === "bl" ? "0 0 0 6px" : "0 0 6px 0",
            }}
          />
        ))}
      </div>

      {/* Status indicator */}
      {active && (
        <div
          className="absolute flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            top: "60%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.5)",
            marginTop: 16,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#51C675",
              flexShrink: 0,
              animation: "pulse 1.5s infinite",
            }}
          />
          <span className="text-xs font-medium text-white">Scannen…</span>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}
