"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Search, Lock, Clock, ChefHat, Loader2, SlidersHorizontal, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReceptCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  difficulty: string;
  flavor: string | null;
  duur: number | null;
  isPremium: boolean;
  imageUrl: string | null;
  posterUrl: string | null;
  product: string | null;
  teaser: string | null;
}

const SMAKEN = ["alle", "melk", "puur", "noot", "fruit", "citrus"];
const MOEILIJKHEDEN = ["alle", "makkelijk", "gemiddeld", "moeilijk"];

const difficultyLabel: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  moeilijk: "Moeilijk",
};

const difficultyColor: Record<string, string> = {
  makkelijk: "#059669",
  gemiddeld: "#b45309",
  moeilijk: "#be123c",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReceptenOverzicht() {
  const [recepten, setRecepten] = useState<ReceptCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoekterm, setZoekterm] = useState("");
  const [smaak, setSmaak] = useState("alle");
  const [moeilijkheid, setMoeilijkheid] = useState("alle");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchRecepten = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (zoekterm) params.set("zoek", zoekterm);
      if (smaak !== "alle") params.set("smaak", smaak);
      if (moeilijkheid !== "alle") params.set("moeilijkheid", moeilijkheid);

      const res = await fetch(`/api/recepten?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setRecepten(
        data.recepten
          .filter((r: ReceptCard) => r.posterUrl?.includes("Poster1"))
          .slice(0, 4)
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [zoekterm, smaak, moeilijkheid]);

  useEffect(() => {
    const t = setTimeout(fetchRecepten, zoekterm ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchRecepten, zoekterm]);

  const uitgelicht = recepten.find((r) => !r.isPremium);
  const rest = recepten.filter((r) => r.id !== uitgelicht?.id);
  const activeFilters =
    (smaak !== "alle" ? 1 : 0) + (moeilijkheid !== "alle" ? 1 : 0);

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "#F5F8F5", fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-5 pt-14 pb-5"
        style={{ background: "#ffffff", borderBottom: "1px solid #e8ede9" }}
      >
        <p
          className="text-xs font-medium tracking-widest uppercase mb-1"
          style={{ color: "#51C675" }}
        >
          Avéline Atelier
        </p>
        <h1
          className="font-display font-semibold leading-tight"
          style={{ fontSize: "clamp(1.75rem, 6vw, 2.25rem)", color: "#122A1A" }}
        >
          Recepten &amp; <em style={{ fontStyle: "italic", color: "#304C3A" }}>Inspiratie</em>
        </h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "#6B7F73" }}>
          Verfijnde bereidingen met ambachtelijke chocolades.
        </p>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Uitgelicht recept */}
        {uitgelicht && uitgelicht.posterUrl && (
          <Link
            href={`/recepten/${uitgelicht.slug}`}
            className="block mx-5 mt-5 rounded-2xl overflow-hidden relative"
            style={{ height: 200 }}
          >
            <Image
              src={uitgelicht.posterUrl}
              alt={uitgelicht.title}
              fill
              className="object-cover"
              sizes="(max-width: 430px) 100vw, 430px"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(18,42,26,0.85) 0%, rgba(18,42,26,0.2) 55%, transparent 100%)",
              }}
            />
            <div className="absolute top-3 left-3">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: "rgba(81,198,117,0.25)",
                  color: "#51C675",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(81,198,117,0.3)",
                }}
              >
                Uitgelicht
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                {uitgelicht.duur && `${uitgelicht.duur} min · `}
                {difficultyLabel[uitgelicht.difficulty]}
              </p>
              <h2 className="font-display font-semibold text-lg leading-tight text-white">
                {uitgelicht.title}
              </h2>
              {uitgelicht.subtitle && (
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {uitgelicht.subtitle}
                </p>
              )}
              <p className="text-xs font-medium mt-2" style={{ color: "#51C675" }}>
                Bekijk recept →
              </p>
            </div>
          </Link>
        )}

        {/* ── Zoek + filter ─────────────────────────────────────── */}
        <div className="px-5 mt-5">
          <div className="flex gap-2">
            <div
              className="flex items-center flex-1 gap-2 px-3 rounded-xl"
              style={{ background: "#ffffff", border: "1.5px solid #e8ede9", height: 44 }}
            >
              <Search size={15} color="#9aada2" />
              <input
                type="search"
                placeholder="Zoek recept of chocolade…"
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: "#122A1A" }}
              />
              {zoekterm && (
                <button onClick={() => setZoekterm("")} aria-label="Wissen">
                  <X size={14} color="#9aada2" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="w-11 h-11 rounded-xl flex items-center justify-center relative flex-shrink-0 transition-colors"
              style={{
                background: filterOpen ? "#304C3A" : "#ffffff",
                border: "1.5px solid #e8ede9",
              }}
              aria-label="Filters"
            >
              <SlidersHorizontal size={16} color={filterOpen ? "#ffffff" : "#304C3A"} />
              {activeFilters > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ background: "#51C675", fontSize: 10, fontWeight: 700 }}
                >
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div
              className="mt-3 p-4 rounded-2xl flex flex-col gap-4"
              style={{ background: "#EFF5EE" }}
            >
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#6B7F73" }}>
                  Smaak
                </p>
                <div className="flex flex-wrap gap-2">
                  {SMAKEN.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSmaak(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      style={{
                        background: smaak === s ? "#304C3A" : "#ffffff",
                        color: smaak === s ? "#ffffff" : "#304C3A",
                        border: "1.5px solid",
                        borderColor: smaak === s ? "#304C3A" : "#BDD2B7",
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#6B7F73" }}>
                  Moeilijkheid
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOEILIJKHEDEN.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMoeilijkheid(m)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      style={{
                        background: moeilijkheid === m ? "#304C3A" : "#ffffff",
                        color: moeilijkheid === m ? "#ffffff" : "#304C3A",
                        border: "1.5px solid",
                        borderColor: moeilijkheid === m ? "#304C3A" : "#BDD2B7",
                      }}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Recepten grid ─────────────────────────────────────── */}
        <div className="px-5 mt-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16" style={{ color: "#9aada2" }}>
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm">Recepten laden…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ChefHat size={32} strokeWidth={1.2} color="#9aada2" />
              <p className="text-sm" style={{ color: "#6B7F73" }}>Kon recepten niet laden.</p>
              <button
                onClick={fetchRecepten}
                className="px-4 py-2 rounded-full text-xs font-medium text-white"
                style={{ background: "#304C3A" }}
              >
                Opnieuw proberen
              </button>
            </div>
          ) : rest.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ChefHat size={32} strokeWidth={1.2} color="#9aada2" />
              <p className="text-sm" style={{ color: "#6B7F73" }}>Geen recepten gevonden.</p>
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: "#9aada2" }}>
                {rest.length} recept{rest.length !== 1 ? "en" : ""}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {rest.map((r) =>
                  r.isPremium ? (
                    <div
                      key={r.id}
                      className="rounded-2xl overflow-hidden relative"
                      style={{ aspectRatio: "2/3", background: "#122A1A" }}
                    >
                      {r.posterUrl && (
                        <Image
                          src={r.posterUrl}
                          alt={r.title}
                          fill
                          className="object-cover opacity-60"
                          sizes="50vw"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(18,42,26,0.92) 0%, transparent 60%)",
                        }}
                      />
                      {/* Premium badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(18,42,26,0.7)",
                            color: "#BDD2B7",
                            border: "1px solid rgba(189,210,183,0.3)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <Lock size={9} /> Premium
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p
                          className="text-xs mb-1"
                          style={{ color: difficultyColor[r.difficulty] ?? "#9aada2" }}
                        >
                          {difficultyLabel[r.difficulty] ?? r.difficulty}
                        </p>
                        <h3
                          className="font-display font-semibold text-sm leading-tight text-white mb-2"
                        >
                          {r.title}
                        </h3>
                        <Link
                          href="/register"
                          className="block text-center text-xs font-medium py-1.5 rounded-xl"
                          style={{
                            background: "rgba(81,198,117,0.15)",
                            color: "#51C675",
                            border: "1px solid rgba(81,198,117,0.3)",
                          }}
                        >
                          Account aanmaken
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={r.id}
                      href={`/recepten/${r.slug}`}
                      className="block rounded-2xl overflow-hidden relative"
                      style={{ aspectRatio: "2/3", background: "#122A1A" }}
                    >
                      {r.posterUrl && (
                        <Image
                          src={r.posterUrl}
                          alt={r.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="50vw"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(18,42,26,0.88) 0%, rgba(18,42,26,0.1) 55%, transparent 100%)",
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.85)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {difficultyLabel[r.difficulty] ?? r.difficulty}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        {r.duur && (
                          <p className="flex items-center gap-1 text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                            <Clock size={10} /> {r.duur} min
                          </p>
                        )}
                        <h3 className="font-display font-semibold text-sm leading-tight text-white">
                          {r.title}
                        </h3>
                        {r.subtitle && (
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                            {r.subtitle}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Premium upsell banner ─────────────────────────────── */}
        <div
          className="mx-5 mt-6 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#304C3A" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(81,198,117,0.15)" }}
          >
            <Lock size={18} color="#51C675" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-snug">
              Ontgrendel alle premium recepten
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              Gratis account — video-tutorials inbegrepen
            </p>
          </div>
          <Link
            href="/register"
            className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl"
            style={{ background: "#51C675", color: "#122A1A" }}
          >
            Gratis
          </Link>
        </div>
      </div>
    </div>
  );
}