"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Lock,
  Clock,
  Star,
  Loader2,
  ChefHat,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
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

const SMAKEN = ["alle", "puur", "melk", "noot", "fruit", "citrus"];
const MOEILIJKHEDEN = ["alle", "makkelijk", "gemiddeld", "moeilijk"];

const difficultyClass: Record<string, string> = {
  makkelijk: "tag-easy",
  gemiddeld: "tag-med",
  moeilijk:  "tag-hard",
};
const difficultyLabel: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  moeilijk:  "Moeilijk",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReceptenOverzicht() {
  const [recepten, setRecepten]           = useState<ReceptCard[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [zoekterm, setZoekterm]           = useState("");
  const [smaak, setSmaak]                 = useState("alle");
  const [moeilijkheid, setMoeilijkheid]   = useState("alle");
  const [filterOpen, setFilterOpen]       = useState(false);

  const fetchRecepten = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (zoekterm)                params.set("zoek", zoekterm);
      if (smaak !== "alle")        params.set("smaak", smaak);
      if (moeilijkheid !== "alle") params.set("moeilijkheid", moeilijkheid);

      const res = await fetch(`/api/recepten?${params.toString()}`);
      if (!res.ok) throw new Error("fetch mislukt");
      const data = await res.json();
      setRecepten(data.recepten);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [zoekterm, smaak, moeilijkheid]);

  useEffect(() => {
    const timer = setTimeout(fetchRecepten, zoekterm ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchRecepten, zoekterm]);

  const uitgelicht = recepten.find((r) => !r.isPremium);

  return (
    <div className="page">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="eyebrow">Avéline Atelier</p>
          <h1 className="hero-title">
            Recepten &amp;<br />
            <em className="hero-accent">Inspiratie</em>
          </h1>
          <p className="hero-desc">
            Ontdek verfijnde bereidingen met onze ambachtelijke chocolades —
            van snelle truffels tot meesterlijke taarten.
          </p>
        </div>

        {uitgelicht && (
          <div className="hero-feature">
            <div className="feature-img-wrap">
              {uitgelicht.posterUrl && (
                <Image
                  src={uitgelicht.posterUrl}
                  alt={uitgelicht.title}
                  fill
                  className="feature-img"
                  sizes="(max-width: 480px) 140px, 200px"
                  priority
                />
              )}
            </div>
            <div className="feature-info">
              <span className="feature-tag">Uitgelicht recept</span>
              <h2 className="feature-name">{uitgelicht.title}</h2>
              {uitgelicht.subtitle && (
                <p className="feature-sub-italic">{uitgelicht.subtitle}</p>
              )}
              <p className="feature-teaser">{uitgelicht.teaser}</p>
              <Link href={`/recepten/${uitgelicht.slug}`} className="feature-cta">
                Bekijk recept
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Zoek & Filter ────────────────────────────────────────────── */}
      <section className="search-bar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Zoek recept of chocolade…"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className={`filter-btn ${filterOpen ? "active" : ""}`}
          onClick={() => setFilterOpen(!filterOpen)}
          aria-expanded={filterOpen}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </section>

      {filterOpen && (
        <div className="filter-panel">
          <fieldset className="filter-group">
            <legend>Smaak</legend>
            <div className="pills">
              {SMAKEN.map((s) => (
                <button
                  key={s}
                  className={`pill ${smaak === s ? "pill-on" : ""}`}
                  onClick={() => setSmaak(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter-group">
            <legend>Moeilijkheid</legend>
            <div className="pills">
              {MOEILIJKHEDEN.map((m) => (
                <button
                  key={m}
                  className={`pill ${moeilijkheid === m ? "pill-on" : ""}`}
                  onClick={() => setMoeilijkheid(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* ── Resultaten ───────────────────────────────────────────────── */}
      <main className="main">
        <p className="results-count">
          {recepten.length} recept{recepten.length !== 1 ? "en" : ""} gevonden
        </p>

        {loading ? (
          <div className="empty">
            <Loader2 size={28} strokeWidth={1.2} className="spin" />
            <p>Recepten laden…</p>
          </div>
        ) : error ? (
          <div className="empty">
            <ChefHat size={36} strokeWidth={1.2} />
            <p>Kon recepten niet laden. Probeer het later opnieuw.</p>
            <button className="pill" onClick={fetchRecepten}>
              Opnieuw proberen
            </button>
          </div>
        ) : recepten.length === 0 ? (
          <div className="empty">
            <ChefHat size={36} strokeWidth={1.2} />
            <p>Geen recepten gevonden voor deze zoekopdracht.</p>
          </div>
        ) : (
          <ul className="grid">
            {recepten.map((r, i) =>
              r.isPremium ? (
                /* ── Premium kaart ── */
                <li key={r.id} className="card-li" style={{ animationDelay: `${i * 55}ms` }}>
                  <div className="card premium">
                    <div className="card-img-wrap">
                      {r.imageUrl && (
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="card-img blurred"
                          sizes="(max-width: 480px) 120px, 160px"
                        />
                      )}
                      <span className="prem-badge">
                        <Lock size={10} /> Premium
                      </span>
                    </div>
                    <div className="card-body">
                      <span className={`diff-tag ${difficultyClass[r.difficulty] ?? ""}`}>
                        {difficultyLabel[r.difficulty] ?? r.difficulty}
                      </span>
                      <h3 className="card-title">{r.title}</h3>
                      {r.subtitle && <p className="card-sub">{r.subtitle}</p>}
                      <p className="card-teaser">{r.teaser}</p>
                      <div className="card-meta">
                        {r.duur   && <span><Clock size={11} /> {r.duur} min</span>}
                        {r.product && <span><Star  size={11} /> {r.product}</span>}
                      </div>
                      <Link href="/register" className="prem-cta">
                        Account aanmaken voor toegang
                      </Link>
                    </div>
                  </div>
                </li>
              ) : (
                /* ── Publiek recept ── */
                <li key={r.id} className="card-li" style={{ animationDelay: `${i * 55}ms` }}>
                  <Link href={`/recepten/${r.slug}`} className="card">
                    <div className="card-img-wrap">
                      {r.imageUrl && (
                        <Image
                          src={r.imageUrl}
                          alt={r.title}
                          fill
                          className="card-img"
                          sizes="(max-width: 480px) 120px, 160px"
                        />
                      )}
                      {r.posterUrl && (
                        <div className="poster-hover">
                          <Image
                            src={r.posterUrl}
                            alt=""
                            fill
                            className="card-img"
                            sizes="(max-width: 480px) 120px, 160px"
                          />
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <span className={`diff-tag ${difficultyClass[r.difficulty] ?? ""}`}>
                        {difficultyLabel[r.difficulty] ?? r.difficulty}
                      </span>
                      <h3 className="card-title">{r.title}</h3>
                      {r.subtitle && <p className="card-sub">{r.subtitle}</p>}
                      <p className="card-teaser">{r.teaser}</p>
                      <div className="card-meta">
                        {r.duur    && <span><Clock size={11} /> {r.duur} min</span>}
                        {r.product && <span><Star  size={11} /> {r.product}</span>}
                      </div>
                      <span className="card-cta">Bekijk recept →</span>
                    </div>
                  </Link>
                </li>
              )
            )}
          </ul>
        )}
      </main>

      {/* ── Premium banner ───────────────────────────────────────────── */}
      <section className="banner">
        <div className="banner-deco" />
        <div className="banner-inner">
          <Lock size={20} strokeWidth={1.5} className="banner-icon" />
          <div className="banner-text">
            <h2>Ontgrendel alle premium recepten</h2>
            <p>
              Maak gratis een account aan en krijg toegang tot exclusieve
              video-tutorials, moeilijkere bereidingen en gepersonaliseerde
              aanbevelingen.
            </p>
          </div>
          <Link href="/register" className="banner-cta">
            Gratis registreren
          </Link>
        </div>
      </section>

      {/* ── Styles ───────────────────────────────────────────────────── */}
      <style jsx>{`
        /* ─── Tokens ─────────────────────────────────────── */
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

        /* ─── Hero ─────────────────────────────────────────── */
        .hero {
          background: var(--forest);
          padding: 48px 20px 0;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 80% -20%, #2e5c40 0%, transparent 55%),
            radial-gradient(ellipse at 5%  110%, #0f2419 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-content { position: relative; padding-bottom: 32px; }

        .eyebrow {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 14px;
        }
        .hero-title {
          font-size: clamp(2.2rem, 9vw, 3.5rem);
          font-weight: 400;
          line-height: 1.05;
          color: var(--cream);
          margin: 0 0 14px;
        }
        .hero-accent { color: var(--gold); font-style: italic; }
        .hero-desc {
          font-family: var(--sans);
          font-size: 0.9rem;
          color: rgba(248,244,237,0.7);
          line-height: 1.65;
          max-width: 340px;
          margin: 0;
        }

        /* ─── Featured card (binnen hero) ─────────────────── */
        .hero-feature {
          position: relative;
          margin: 28px -20px 0;
          display: grid;
          grid-template-columns: 140px 1fr;
          background: var(--cream);
          border-top: 1px solid rgba(201,168,76,0.3);
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .hero-feature { grid-template-columns: 180px 1fr; }
        }
        @media (min-width: 768px) {
          .hero {
            padding: 80px 60px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: end;
            gap: 40px;
          }
          .hero-content { padding-bottom: 48px; }
          .hero-feature {
            margin: 0 0 0 0;    /* reset negative margin */
            border-top: none;
            border-left: none;
            align-self: end;
            box-shadow: 0 -20px 60px rgba(0,0,0,0.35);
          }
        }

        .feature-img-wrap {
          position: relative;
          height: 160px;
        }
        @media (min-width: 480px) { .feature-img-wrap { height: 190px; } }
        @media (min-width: 768px) { .feature-img-wrap { height: 260px; } }
        .feature-img { object-fit: cover; object-position: center top; }

        .feature-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        @media (min-width: 768px) { .feature-info { padding: 28px 24px; gap: 8px; } }

        .feature-tag {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          border: 1px solid rgba(201,168,76,0.4);
          padding: 2px 8px;
          display: inline-block;
          width: fit-content;
        }
        .feature-name {
          font-size: clamp(1rem, 3.5vw, 1.5rem);
          font-weight: 400;
          color: var(--forest);
          margin: 0;
          line-height: 1.15;
        }
        .feature-sub-italic {
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--gold);
          font-style: italic;
          margin: 0;
        }
        .feature-teaser {
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--muted);
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .feature-cta {
          font-family: var(--sans);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--forest);
          text-decoration: none;
          border-bottom: 1px solid var(--forest);
          padding-bottom: 1px;
          width: fit-content;
          display: inline-block;
        }
        .feature-cta:hover { color: var(--gold); border-color: var(--gold); }

        /* ─── Zoek & filter ────────────────────────────────── */
        .search-bar {
          padding: 20px 20px 0;
          display: flex;
          gap: 10px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 768px) { .search-bar { padding: 36px 60px 0; } }

        .search-wrap { flex: 1; position: relative; }
        .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }
        .search-input {
          width: 100%;
          padding: 10px 12px 10px 34px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 0.88rem;
          color: var(--text);
          outline: none;
          border-radius: 2px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .search-input:focus { border-color: var(--forest); }
        .search-input::placeholder { color: var(--muted); }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 14px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-family: var(--sans);
          font-size: 0.82rem;
          color: var(--text);
          cursor: pointer;
          border-radius: 2px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .filter-btn.active,
        .filter-btn:hover { background: var(--forest); color: var(--cream); border-color: var(--forest); }

        .filter-panel {
          max-width: 1100px;
          margin: 12px auto 0;
          padding: 0 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          animation: slideDown 0.2s ease;
        }
        @media (min-width: 768px) { .filter-panel { padding: 0 60px; } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .filter-group { border: none; padding: 0; margin: 0; }
        .filter-group legend {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill {
          padding: 5px 12px;
          border: 1px solid var(--border);
          background: white;
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--muted);
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.15s;
        }
        .pill:hover { border-color: var(--forest); color: var(--forest); }
        .pill-on { background: var(--forest); border-color: var(--forest); color: var(--cream); }

        /* ─── Main / grid ──────────────────────────────────── */
        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px 20px 60px;
        }
        @media (min-width: 768px) { .main { padding: 28px 60px 80px; } }

        .results-count {
          font-family: var(--sans);
          font-size: 0.75rem;
          color: var(--muted);
          letter-spacing: 0.04em;
          margin: 0 0 14px;
        }

        .empty {
          text-align: center;
          padding: 60px 24px;
          color: var(--muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          font-family: var(--sans);
          font-size: 0.9rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* Grid: 1-kolom op mobiel, 2-kolom vanaf 600px, 3-kolom vanaf 960px */
        .grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 600px) {
          .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (min-width: 960px) {
          .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }

        /* ─── Kaart ────────────────────────────────────────── */
        .card-li {
          animation: fadeUp 0.35s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobiel: horizontale layout (thumbnail links) */
        .card {
          display: grid;
          grid-template-columns: 120px 1fr;
          background: white;
          border: 1px solid var(--border);
          border-radius: 2px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          height: 100%;
          transition: box-shadow 0.22s, transform 0.22s;
          -webkit-tap-highlight-color: transparent;
        }
        /* Vanaf 600px: verticale card layout */
        @media (min-width: 600px) {
          .card {
            grid-template-columns: 1fr;
            grid-template-rows: 200px 1fr;
          }
        }
        @media (min-width: 960px) {
          .card:not(.premium):hover {
            box-shadow: 0 12px 40px rgba(28,58,42,0.12);
            transform: translateY(-3px);
          }
          .card:not(.premium):hover .poster-hover { opacity: 1; }
        }

        .card-img-wrap {
          position: relative;
          overflow: hidden;
          background: var(--cream);
          /* Mobiel: vaste breedte via grid-column */
          min-height: 120px;
        }
        @media (min-width: 600px) {
          .card-img-wrap { min-height: 0; }
        }

        .card-img {
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card:hover .card-img:not(.blurred) { transform: scale(1.03); }
        .card-img.blurred { filter: blur(5px); transform: scale(1.08); }

        .poster-hover {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .prem-badge {
          position: absolute;
          top: 8px;
          left: 0;
          background: var(--forest);
          color: var(--gold-light);
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 3px 8px 3px 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--gold);
          border-left: none;
        }

        .card-body {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          justify-content: center;
        }
        @media (min-width: 600px) {
          .card-body { padding: 18px 20px; justify-content: flex-start; }
        }

        .diff-tag {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 2px;
          width: fit-content;
          font-weight: 500;
        }
        .tag-easy { background: #d1fae5; color: #065f46; }
        .tag-med  { background: #fef3c7; color: #92400e; }
        .tag-hard { background: #ffe4e6; color: #9f1239; }

        .card-title {
          font-size: clamp(0.95rem, 2.5vw, 1.15rem);
          font-weight: 400;
          color: var(--forest);
          line-height: 1.2;
          margin: 2px 0 0;
        }
        .card-sub {
          font-family: var(--sans);
          font-size: 0.72rem;
          color: var(--gold);
          font-style: italic;
          margin: 0;
        }
        .card-teaser {
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--muted);
          line-height: 1.45;
          margin: 2px 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Op mobiel teaser verbergen voor ruimte */
        @media (max-width: 400px) { .card-teaser { display: none; } }

        .card-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-family: var(--sans);
          font-size: 0.7rem;
          color: var(--muted);
          margin-top: 2px;
        }
        .card-meta span { display: flex; align-items: center; gap: 3px; }

        .card-cta {
          font-family: var(--sans);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--forest);
          border-bottom: 1px solid var(--forest);
          padding-bottom: 1px;
          width: fit-content;
          margin-top: 4px;
          display: inline-block;
        }
        .prem-cta {
          display: block;
          margin-top: 8px;
          padding: 8px 12px;
          background: var(--forest);
          color: var(--gold-light);
          text-decoration: none;
          font-family: var(--sans);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          border: 1px solid var(--gold);
          border-radius: 1px;
          transition: background 0.2s;
        }
        .prem-cta:hover { background: var(--forest-mid); }

        /* ─── Premium banner ───────────────────────────────── */
        .banner {
          background: var(--forest);
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 768px) { .banner { padding: 60px 60px; } }
        .banner-deco {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 24px,
            rgba(201,168,76,0.04) 24px,
            rgba(201,168,76,0.04) 25px
          );
        }
        .banner-inner {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .banner-inner { flex-direction: row; align-items: center; gap: 28px; }
        }
        .banner-icon { color: var(--gold); flex-shrink: 0; }
        .banner-text { flex: 1; }
        .banner-text h2 {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 8px;
        }
        .banner-text p {
          font-family: var(--sans);
          font-size: 0.875rem;
          color: rgba(248,244,237,0.7);
          line-height: 1.6;
          margin: 0;
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
          transition: background 0.2s;
          white-space: nowrap;
          display: inline-block;
        }
        .banner-cta:hover { background: var(--gold-light); }
      `}</style>
    </div>
  );
}