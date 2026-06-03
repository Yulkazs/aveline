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

      // FIX: alleen recepten met "Poster1" in de posterUrl, max 4
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
    <div className="page">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Avéline Atelier</p>
          <h1 className="hero-title">
            Recepten &amp;<br />
            <em>Inspiratie</em>
          </h1>
          <p className="hero-desc">
            Verfijnde bereidingen met onze ambachtelijke chocolades —
            van snelle truffels tot meesterlijke taarten.
          </p>
        </div>

        {/* Featured recept */}
        {uitgelicht && uitgelicht.posterUrl && (
          <Link href={`/recepten/${uitgelicht.slug}`} className="hero-feature">
            <div className="hf-img-wrap">
              <Image
                src={uitgelicht.posterUrl}
                alt={uitgelicht.title}
                fill
                className="hf-img"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="hf-gradient" />
            </div>
            <div className="hf-content">
              <span className="hf-tag">Uitgelicht recept</span>
              <h2 className="hf-title">{uitgelicht.title}</h2>
              {uitgelicht.subtitle && (
                <p className="hf-sub">{uitgelicht.subtitle}</p>
              )}
              <div className="hf-meta">
                {uitgelicht.duur && (
                  <span><Clock size={12} /> {uitgelicht.duur} min</span>
                )}
                <span>{difficultyLabel[uitgelicht.difficulty]}</span>
              </div>
              <span className="hf-cta">Bekijk recept →</span>
            </div>
          </Link>
        )}
      </header>

      {/* ── Zoekbalk ──────────────────────────────────────────────────── */}
      <div className="search-section">
        <div className="search-row">
          {/* FIX: search-wrap met correcte positional context */}
          <div className="search-wrap">
            <Search size={15} className="search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Zoek recept of chocolade…"
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="search-input"
            />
            {zoekterm && (
              <button
                className="search-clear"
                onClick={() => setZoekterm("")}
                aria-label="Zoekopdracht wissen"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            className={`filter-btn ${filterOpen ? "open" : ""}`}
            onClick={() => setFilterOpen(!filterOpen)}
            aria-label="Filters openen"
          >
            <SlidersHorizontal size={14} />
            {activeFilters > 0 && (
              <span className="filter-count">{activeFilters}</span>
            )}
          </button>
        </div>

        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-group">
              <p className="filter-label">Smaak</p>
              <div className="pills">
                {SMAKEN.map((s) => (
                  <button
                    key={s}
                    className={`pill ${smaak === s ? "on" : ""}`}
                    onClick={() => setSmaak(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-label">Moeilijkheid</p>
              <div className="pills">
                {MOEILIJKHEDEN.map((m) => (
                  <button
                    key={m}
                    className={`pill ${moeilijkheid === m ? "on" : ""}`}
                    onClick={() => setMoeilijkheid(m)}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <main className="main">
        {loading ? (
          <div className="state">
            <Loader2 size={24} className="spin" />
            <p>Recepten laden…</p>
          </div>
        ) : error ? (
          <div className="state">
            <ChefHat size={32} strokeWidth={1.2} />
            <p>Kon recepten niet laden.</p>
            <button className="pill on" onClick={fetchRecepten}>
              Opnieuw proberen
            </button>
          </div>
        ) : recepten.length === 0 ? (
          <div className="state">
            <ChefHat size={32} strokeWidth={1.2} />
            <p>Geen recepten gevonden.</p>
          </div>
        ) : (
          <>
            <p className="count">
              {recepten.length} recept{recepten.length !== 1 ? "en" : ""}
            </p>
            <ul className="grid">
              {rest.map((r, i) =>
                r.isPremium ? (
                  <li key={r.id} className="card-li" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="card premium">
                      <div className="card-img-wrap">
                        <Image
                          src={r.posterUrl!}
                          alt={r.title}
                          fill
                          className="card-img"
                          sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                        />
                        <div className="card-overlay" />
                        <div className="card-top-row">
                          <span className="diff-badge diff-badge--dark">
                            {difficultyLabel[r.difficulty] ?? r.difficulty}
                          </span>
                          <span className="prem-badge">
                            <Lock size={9} /> Premium
                          </span>
                        </div>
                        <div className="card-bottom">
                          <h3 className="card-title-over">{r.title}</h3>
                          {r.subtitle && (
                            <p className="card-sub-over">{r.subtitle}</p>
                          )}
                          <div className="card-meta-over">
                            {r.duur && (
                              <span><Clock size={11} /> {r.duur} min</span>
                            )}
                            {r.product && <span>{r.product}</span>}
                          </div>
                          <Link href="/register" className="card-cta-prem">
                            Account aanmaken
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={r.id} className="card-li" style={{ animationDelay: `${i * 60}ms` }}>
                    <Link href={`/recepten/${r.slug}`} className="card">
                      <div className="card-img-wrap">
                        <Image
                          src={r.posterUrl!}
                          alt={r.title}
                          fill
                          className="card-img"
                          sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                        />
                        <div className="card-overlay" />
                        <div className="card-top-row">
                          <span className="diff-badge">
                            {difficultyLabel[r.difficulty] ?? r.difficulty}
                          </span>
                        </div>
                        <div className="card-bottom">
                          <h3 className="card-title-over">{r.title}</h3>
                          {r.subtitle && (
                            <p className="card-sub-over">{r.subtitle}</p>
                          )}
                          <div className="card-meta-over">
                            {r.duur && (
                              <span><Clock size={11} /> {r.duur} min</span>
                            )}
                            {r.product && <span>{r.product}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </>
        )}
      </main>

      {/* ── Banner ────────────────────────────────────────────────────── */}
      <section className="banner">
        <div className="banner-inner">
          <Lock size={18} strokeWidth={1.5} className="banner-icon" />
          <div>
            <h2 className="banner-title">Ontgrendel alle premium recepten</h2>
            <p className="banner-desc">
              Gratis account — exclusieve video-tutorials en gepersonaliseerde aanbevelingen.
            </p>
          </div>
          <Link href="/register" className="banner-cta">
            Gratis registreren
          </Link>
        </div>
      </section>

      {/* ── Styles ────────────────────────────────────────────────────── */}
      <style jsx>{`
        /* ── Tokens ── */
        .page {
          --forest:     #1c3a2a;
          --forest-mid: #2a5040;
          --gold:       #c9a84c;
          --gold-light: #e8d49a;
          --cream:      #f8f4ed;
          --warm-white: #fffdf8;
          --text:       #1a1a18;
          --muted:      #6b6255;
          --border:     #e0d5c5;
          --sans: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          background: var(--warm-white);
          color: var(--text);
          font-family: "Georgia", "Times New Roman", serif;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .hero {
          background: var(--forest);
          padding: 40px 20px 0;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .hero {
            padding: 64px 48px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: end;
            gap: 40px;
          }
        }
        .hero-inner { padding-bottom: 32px; }
        .eyebrow {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 12px;
        }
        .hero-title {
          font-size: clamp(2.4rem, 9vw, 3.8rem);
          font-weight: 400;
          line-height: 1.05;
          color: var(--cream);
          margin: 0 0 16px;
        }
        .hero-title em { color: var(--gold); font-style: italic; }
        .hero-desc {
          font-family: var(--sans);
          font-size: 0.9rem;
          color: rgba(248,244,237,0.65);
          line-height: 1.65;
          max-width: 320px;
          margin: 0;
        }

        /* Featured */
        .hero-feature {
          display: block;
          position: relative;
          text-decoration: none;
          margin: 0 -20px;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .hero-feature {
            margin: 0;
            border-radius: 2px 2px 0 0;
          }
        }
        .hf-img-wrap {
          position: relative;
          /* FIX: vaste hoogte zodat de afbeelding niet te klein wordt */
          height: clamp(260px, 60vw, 380px);
        }
        @media (min-width: 768px) {
          .hf-img-wrap { height: 340px; }
        }
        /* FIX: object-position center zodat de chocolade zichtbaar blijft */
        .hf-img {
          object-fit: cover;
          object-position: center center;
          transition: transform 0.5s ease;
        }
        .hero-feature:hover .hf-img { transform: scale(1.03); }
        .hf-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(14,30,20,0.9) 0%,
            rgba(14,30,20,0.2) 55%,
            transparent 100%
          );
        }
        .hf-content {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 20px;
        }
        @media (min-width: 768px) { .hf-content { padding: 28px; } }
        .hf-tag {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          border: 1px solid rgba(201,168,76,0.5);
          padding: 2px 8px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .hf-title {
          font-size: clamp(1.3rem, 5vw, 2rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 4px;
          line-height: 1.1;
        }
        .hf-sub {
          font-family: var(--sans);
          font-size: 0.8rem;
          color: var(--gold);
          font-style: italic;
          margin: 0 0 8px;
        }
        .hf-meta {
          display: flex;
          gap: 14px;
          font-family: var(--sans);
          font-size: 0.75rem;
          color: rgba(248,244,237,0.6);
          margin-bottom: 12px;
        }
        .hf-meta span { display: flex; align-items: center; gap: 4px; }
        .hf-cta {
          font-family: var(--sans);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cream);
          border-bottom: 1px solid rgba(248,244,237,0.4);
          padding-bottom: 2px;
          display: inline-block;
          transition: color 0.2s, border-color 0.2s;
        }
        .hero-feature:hover .hf-cta { color: var(--gold); border-color: var(--gold); }

        /* ── Zoekbalk ── */
        /* FIX: box-sizing op de sectie zelf zodat padding niet overloopt */
        .search-section {
          padding: 20px 20px 0;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
        }
        @media (min-width: 768px) { .search-section { padding: 32px 48px 0; } }

        .search-row {
          display: flex;
          gap: 10px;
          align-items: center;
          width: 100%;
        }

        /* FIX: search-wrap neemt de resterende breedte in en heeft position: relative */
        .search-wrap {
          flex: 1;
          min-width: 0; /* voorkomt overflow in flex-context */
          position: relative;
          display: flex;
          align-items: center;
        }

        /* FIX: icon correct gecentreerd via flex, niet via absolute + transform */
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
          flex-shrink: 0;
          z-index: 1;
        }

        /* FIX: expliciete breedte + box-sizing zodat padding niet buiten de wrapper valt */
        .search-input {
          width: 100%;
          padding: 12px 36px 12px 38px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 0.9rem;
          color: var(--text);
          outline: none;
          border-radius: 2px;
          box-sizing: border-box;
          -webkit-appearance: none;
          transition: border-color 0.2s;
          display: block;
        }
        .search-input:focus { border-color: var(--forest); }
        .search-input::placeholder { color: var(--muted); }

        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .filter-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          /* FIX: vaste breedte zodat de knop niet krimpt op small screens */
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 0.85rem;
          color: var(--text);
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        /* Op bredere schermen mag de knop wat meer padding hebben */
        @media (min-width: 400px) {
          .filter-btn {
            width: auto;
            padding: 0 16px;
            height: 44px;
          }
        }
        .filter-btn.open,
        .filter-btn:hover {
          background: var(--forest);
          color: var(--cream);
          border-color: var(--forest);
        }
        .filter-count {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 16px;
          height: 16px;
          background: var(--gold);
          color: var(--forest);
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-panel {
          margin-top: 12px;
          padding: 16px;
          background: var(--cream);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slideDown 0.2s ease;
          border-radius: 2px;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .filter-label {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0;
        }
        .pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill {
          padding: 6px 14px;
          border: 1px solid var(--border);
          background: white;
          font-family: var(--sans);
          font-size: 0.8rem;
          color: var(--muted);
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .pill:hover { border-color: var(--forest); color: var(--forest); }
        .pill.on { background: var(--forest); border-color: var(--forest); color: var(--cream); }

        /* ── Main / grid ── */
        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 20px 64px;
        }
        @media (min-width: 768px) { .main { padding: 28px 48px 80px; } }

        .count {
          font-family: var(--sans);
          font-size: 0.75rem;
          color: var(--muted);
          margin: 0 0 16px;
          letter-spacing: 0.04em;
        }

        .state {
          text-align: center;
          padding: 64px 24px;
          color: var(--muted);
          font-family: var(--sans);
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* Grid — 1 kolom mobiel, 2 vanaf 560px */
        /* FIX: max 4 items → 2 kolommen volstaat, geen 3-kolomsgrid meer */
        .grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 560px) {
          .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }

        /* ── Kaart ── */
        .card-li {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }
        .card.premium { cursor: default; }

        /* FIX: portretformaat met betere verhouding voor posterafbeeldingen */
        .card-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;   /* was 3/4 → iets slanker, past beter bij staande posters */
          overflow: hidden;
          background: var(--forest);
          border-radius: 3px;
        }

        /* FIX: object-position center center — niet "center top" waardoor chocolade wegsneed */
        .card-img {
          object-fit: cover;
          object-position: center center;
          transition: transform 0.5s ease;
        }
        .card:hover .card-img { transform: scale(1.04); }

        /* Gradient overlay van onder */
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 22, 14, 0.92) 0%,
            rgba(10, 22, 14, 0.4) 45%,
            rgba(10, 22, 14, 0.05) 70%,
            transparent 100%
          );
          border-radius: 3px;
        }

        /* Badge rij bovenaan */
        .card-top-row {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .diff-badge {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 2px;
          background: rgba(248,244,237,0.15);
          backdrop-filter: blur(6px);
          color: var(--cream);
          border: 1px solid rgba(248,244,237,0.2);
        }
        .diff-badge--dark {
          background: rgba(10,22,14,0.5);
          border-color: rgba(248,244,237,0.15);
        }

        .prem-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 3px 8px;
          background: var(--forest);
          color: var(--gold-light);
          border: 1px solid var(--gold);
          border-radius: 2px;
        }

        /* Content onderaan */
        .card-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
        }
        @media (min-width: 560px) { .card-bottom { padding: 20px; } }

        .card-title-over {
          font-size: clamp(1.05rem, 3.5vw, 1.3rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 4px;
          line-height: 1.15;
        }
        .card-sub-over {
          font-family: var(--sans);
          font-size: 0.75rem;
          color: var(--gold);
          font-style: italic;
          margin: 0 0 8px;
        }
        .card-meta-over {
          display: flex;
          gap: 12px;
          font-family: var(--sans);
          font-size: 0.72rem;
          color: rgba(248,244,237,0.55);
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .card-meta-over span { display: flex; align-items: center; gap: 4px; }

        .card-cta-prem {
          display: inline-block;
          padding: 9px 16px;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.5);
          color: var(--gold-light);
          font-family: var(--sans);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
          transition: background 0.2s;
          backdrop-filter: blur(4px);
          -webkit-tap-highlight-color: transparent;
        }
        .card-cta-prem:hover { background: rgba(201,168,76,0.25); }

        /* ── Banner ── */
        .banner {
          background: var(--forest);
          padding: 40px 20px;
        }
        @media (min-width: 768px) { .banner { padding: 52px 48px; } }
        .banner-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        @media (min-width: 640px) {
          .banner-inner { flex-direction: row; align-items: center; gap: 24px; }
        }
        .banner-icon { color: var(--gold); flex-shrink: 0; }
        .banner-title {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 6px;
        }
        .banner-desc {
          font-family: var(--sans);
          font-size: 0.85rem;
          color: rgba(248,244,237,0.65);
          margin: 0;
          line-height: 1.55;
        }
        .banner-cta {
          flex-shrink: 0;
          padding: 12px 24px;
          background: var(--gold);
          color: var(--forest);
          text-decoration: none;
          font-family: var(--sans);
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          border-radius: 1px;
          white-space: nowrap;
          transition: background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .banner-cta:hover { background: var(--gold-light); }
      `}</style>
    </div>
  );
}