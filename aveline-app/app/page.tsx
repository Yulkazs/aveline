"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QrCode, BookOpen, Leaf, MapPin, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    icon: QrCode,
    title: "Scan je chocolade",
    body: "Registreer producten via QR-code en ontdek herkomst, ingrediënten en certificeringen van elke reep.",
    bg: "#EFF5EE",
    iconColor: "#304C3A",
  },
  {
    icon: BookOpen,
    title: "Recepten & inspiratie",
    body: "Bekijk recepten, video-tutorials en ontdek nieuwe smaken — voor thuis en in de keuken.",
    bg: "#E8F2E8",
    iconColor: "#304C3A",
  },
  {
    icon: Leaf,
    title: "Duurzaam & transparant",
    body: "Inzicht in Fairtrade-certificeringen, cacaopercentage en de herkomst van elke reep.",
    bg: "#EFF5EE",
    iconColor: "#304C3A",
  },
  {
    icon: MapPin,
    title: "Winkels & evenementen",
    body: "Ontdek verkooppunten, marktkramen en chocoladeworkshops bij jou in de buurt via geolocatie.",
    bg: "#E8F2E8",
    iconColor: "#304C3A",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const isLast = current === SLIDES.length - 1;

  function goTo(index: number) {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 200);
  }

  function next() {
    if (animating) return;
    if (isLast) { router.push("/welcome"); return; }
    goTo(current + 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50 && current > 0) goTo(current - 1);
    touchStartX.current = null;
  }

  const slide = SLIDES[current];
  const Icon  = slide.icon;

  return (
    <div className="mobile-shell">
      {/* ── Top bar: skip ──────────────────────────────────────────── */}
      <div className="flex justify-end px-5 pt-12 pb-2 flex-shrink-0">
        <button
          onClick={() => router.push("/welcome")}
          className="btn-ghost text-sm"
          style={{ color: "#7a8f82" }}
        >
          Overslaan
        </button>
      </div>

      {/* ── Slide content ──────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center select-none min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ opacity: animating ? 0 : 1, transition: "opacity 200ms ease" }}
      >
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width:           "clamp(100px, 28vw, 144px)",
            height:          "clamp(100px, 28vw, 144px)",
            marginBottom:    "clamp(1.5rem, 5vw, 2.5rem)",
            backgroundColor: slide.bg,
          }}
        >
          <Icon
            style={{
              width:  "clamp(40px, 11vw, 60px)",
              height: "clamp(40px, 11vw, 60px)",
              color:  slide.iconColor,
            }}
            strokeWidth={1.25}
          />
        </div>

        <h2
          className="font-display font-semibold leading-snug"
          style={{
            fontSize:     "clamp(1.6rem, 6vw, 2.1rem)",
            marginBottom: "clamp(0.75rem, 2.5vw, 1rem)",
            color:        "#122A1A",
          }}
        >
          {slide.title}
        </h2>

        <p
          className="leading-relaxed max-w-xs"
          style={{ fontSize: "clamp(0.875rem, 3.5vw, 0.9375rem)", color: "#5a6e62" }}
        >
          {slide.body}
        </p>
      </div>

      {/* ── Bottom nav ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center flex-shrink-0 px-6"
        style={{ paddingBottom: "clamp(1.5rem, 6vw, 3rem)", gap: "1.25rem" }}
      >
        <div className="flex gap-2" role="tablist" aria-label="Stap indicator">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === current ? "24px" : "8px",
                height:     "8px",
                background: i === current ? "#304C3A" : "#BDD2B7",
              }}
            />
          ))}
        </div>

        <button onClick={next} className="btn-primary flex items-center gap-2">
          {isLast ? "Aan de slag" : (
            <><span>Volgende</span><ChevronRight size={18} strokeWidth={2} /></>
          )}
        </button>
      </div>
    </div>
  );
}