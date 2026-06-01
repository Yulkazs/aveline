import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="mobile-shell">

      {/* ── Logo + copy ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-8">
          <Image
            src="/Logo Transparent.png"
            alt="Avéline"
            width={96}
            height={96}
            className="opacity-75"
            priority
          />
        </div>

        <h1
          className="font-display font-semibold leading-tight mb-3"
          style={{ fontSize: "clamp(2rem, 7vw, 2.6rem)", color: "#122A1A" }}
        >
          Welkom bij Avéline
        </h1>

        <p
          className="leading-relaxed max-w-xs"
          style={{ fontSize: "clamp(0.875rem, 3.5vw, 1rem)", color: "#5a6e62" }}
        >
          Ontdek de wereld van premium chocolade
        </p>
      </div>

      {/* ── Bottom actions ─────────────────────────────────────────── */}
      <div
        className="flex flex-col px-6 flex-shrink-0"
        style={{ paddingBottom: "clamp(2rem, 8vw, 3.5rem)", gap: "0.875rem" }}
      >
        <Link href="/register" className="btn-primary">
          Account aanmaken
        </Link>

        <Link href="/login" className="btn-secondary">
          Inloggen
        </Link>

        {/* Gast optie */}
        <Link
          href="/scan"
          className="text-center text-sm font-medium py-2"
          style={{ color: "#9aada2" }}
        >
          Verdergaan als gast →
        </Link>
      </div>

    </div>
  );
}