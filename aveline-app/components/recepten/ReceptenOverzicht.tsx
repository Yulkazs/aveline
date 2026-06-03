"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Lock, Clock, ChefHat, Star, Loader2 } from "lucide-react";

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

const SMAKEN = ["alle", "puur", "noot", "fruit", "citrus"];
const MOEILIJKHEDEN = ["alle", "makkelijk", "gemiddeld", "moeilijk"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const difficultyColor: Record<string, string> = {
  makkelijk: "text-emerald-600 bg-emerald-50",
  gemiddeld: "text-amber-700 bg-amber-50",
  moeilijk: "text-rose-700 bg-rose-50",
};

export default function ReceptenOverzicht() {
  const [recepten, setRecepten] = useState<ReceptCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoekterm, setZoekterm] = useState("");
  const [smaak, setSmaak] = useState("alle");
  const [moeilijkheid, setMoeilijkheid] = useState("alle");
  const [filterOpen, setFilterOpen] = useState(false);

  // Haal recepten op bij elke filterwijziging (debounce voor zoekterm)
  useEffect(() => {
    const timer = setTimeout(() => fetchRecepten(), zoekterm ? 350 : 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoekterm, smaak, moeilijkheid]);

  async function fetchRecepten() {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (zoekterm) params.set("zoek", zoekterm);
      if (smaak !== "alle") params.set("smaak", smaak);
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
  }

  const gefilterd = recepten;
  const uitgelicht = recepten.find((r) => !r.isPremium);

  return (
    <div className="recepten-page">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="hero-eyebrow">Avéline Atelier</p>
          <h1 className="hero-title">
            Recepten &<br />
            <span className="hero-title-accent">Inspiratie</span>
          </h1>
          <p className="hero-desc">
            Ontdek verfijnde bereidingen met onze ambachtelijke chocolades — van
            snelle truffels tot meesterlijke taarten.
          </p>
        </div>
        {uitgelicht && (
          <div className="hero-feature-card">
            <div className="hero-feature-img-wrap">
              {uitgelicht.posterUrl && (
                <Image
                  src={uitgelicht.posterUrl}
                  alt={uitgelicht.title}
                  fill
                  className="hero-feature-img"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
            <div className="hero-feature-label">
              <span className="hero-feature-tag">Uitgelicht recept</span>
              <h2 className="hero-feature-name">{uitgelicht.title}</h2>
              <p className="hero-feature-sub">{uitgelicht.teaser}</p>
              <Link href={`/recepten/${uitgelicht.slug}`} className="hero-cta">
                Bekijk recept
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Zoek & Filter ──────────────────────────────────────────────────── */}
      <section className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Zoek recept of chocolade…"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className={`filter-toggle ${filterOpen ? "active" : ""}`}
          onClick={() => setFilterOpen(!filterOpen)}
          aria-expanded={filterOpen}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>

        {filterOpen && (
          <div className="filter-panel">
            <fieldset className="filter-group">
              <legend>Smaak</legend>
              <div className="filter-pills">
                {SMAKEN.map((s) => (
                  <button
                    key={s}
                    className={`pill ${smaak === s ? "pill-active" : ""}`}
                    onClick={() => setSmaak(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="filter-group">
              <legend>Moeilijkheid</legend>
              <div className="filter-pills">
                {MOEILIJKHEDEN.map((m) => (
                  <button
                    key={m}
                    className={`pill ${moeilijkheid === m ? "pill-active" : ""}`}
                    onClick={() => setMoeilijkheid(m)}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </section>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <main className="recepten-grid-section">
        <p className="results-count">
          {gefilterd.length} recept{gefilterd.length !== 1 ? "en" : ""} gevonden
        </p>

        {loading ? (
          <div className="empty-state">
            <Loader2 size={32} strokeWidth={1.2} className="spin" />
            <p>Recepten laden…</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <ChefHat size={40} strokeWidth={1.2} />
            <p>Kon recepten niet laden. Probeer het later opnieuw.</p>
            <button className="pill" onClick={fetchRecepten}>Opnieuw proberen</button>
          </div>
        ) : gefilterd.length === 0 ? (
          <div className="empty-state">
            <ChefHat size={40} strokeWidth={1.2} />
            <p>Geen recepten gevonden voor deze zoekopdracht.</p>
          </div>
        ) : (
          <ul className="recepten-grid">
            {gefilterd.map((recept, i) => (
              <li key={recept.id} className="recept-card" style={{ animationDelay: `${i * 60}ms` }}>
                {recept.isPremium ? (
                  /* Premium — niet klikbaar, toont registratie-prompt */
                  <div className="card-inner premium">
                    <div className="card-img-wrap">
                      {recept.imageUrl && (
                        <Image
                          src={recept.imageUrl}
                          alt={recept.title}
                          fill
                          className="card-img"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      )}
                      <div className="card-blur-overlay" />
                      <div className="premium-badge">
                        <Lock size={12} />
                        Premium
                      </div>
                    </div>
                    <div className="card-body">
                      <span className={`difficulty-tag ${difficultyColor[recept.difficulty]}`}>
                        {recept.difficulty}
                      </span>
                      <h3 className="card-title">{recept.title}</h3>
                      <p className="card-sub">{recept.subtitle}</p>
                      <p className="card-teaser">{recept.teaser}</p>
                      <div className="card-meta">
                        <span><Clock size={12} /> {recept.duur} min</span>
                        <span><Star size={12} /> {recept.product}</span>
                      </div>
                      <Link href="/register" className="card-cta-premium">
                        Account aanmaken voor toegang
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Publiek recept */
                  <Link href={`/recepten/${recept.slug}`} className="card-inner">
                    <div className="card-img-wrap">
                      {recept.imageUrl && (
                        <Image
                          src={recept.imageUrl}
                          alt={recept.title}
                          fill
                          className="card-img"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      )}
                      {recept.posterUrl && (
                        <div className="card-hover-poster">
                          <Image
                            src={recept.posterUrl}
                            alt=""
                            fill
                            className="card-img"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <span className={`difficulty-tag ${difficultyColor[recept.difficulty]}`}>
                        {recept.difficulty}
                      </span>
                      <h3 className="card-title">{recept.title}</h3>
                      <p className="card-sub">{recept.subtitle}</p>
                      <p className="card-teaser">{recept.teaser}</p>
                      <div className="card-meta">
                        <span><Clock size={12} /> {recept.duur} min</span>
                        <span><Star size={12} /> {recept.product}</span>
                      </div>
                      <span className="card-cta">Bekijk recept →</span>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ── Premium banner ─────────────────────────────────────────────────── */}
      <section className="premium-banner">
        <div className="premium-banner-deco" />
        <div className="premium-banner-content">
          <Lock size={20} strokeWidth={1.5} />
          <div>
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

      {/* ── Styles ─────────────────────────────────────────────────────────── */}
      <style jsx>{`
        /* ── Design tokens ── */
        .recepten-page {
          --forest: #1c3a2a;
          --forest-mid: #2a5040;
          --gold: #c9a84c;
          --gold-light: #e8d49a;
          --cream: #f8f4ed;
          --warm-white: #fffdf8;
          --text: #1a1a18;
          --text-muted: #6b6255;
          --radius: 2px;

          background: var(--warm-white);
          color: var(--text);
          font-family: "Georgia", "Times New Roman", serif;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          background: var(--forest);
          padding: 80px 24px 0;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 768px) {
          .hero {
            padding: 100px 60px 0;
            grid-template-columns: 1fr 1fr;
            align-items: end;
            gap: 40px;
          }
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 0%, #2e5c40 0%, transparent 60%),
            radial-gradient(ellipse at 10% 100%, #0f2419 0%, transparent 50%);
          pointer-events: none;
        }
        /* Subtle grain */
        .hero-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          padding-bottom: 48px;
        }
        .hero-eyebrow {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 20px;
        }
        .hero-title {
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          font-weight: 400;
          line-height: 1.05;
          color: var(--cream);
          margin: 0 0 20px;
          letter-spacing: -0.01em;
        }
        .hero-title-accent {
          color: var(--gold);
          font-style: italic;
        }
        .hero-desc {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 1rem;
          color: rgba(248, 244, 237, 0.7);
          max-width: 400px;
          line-height: 1.6;
          margin: 0;
        }

        .hero-feature-card {
          position: relative;
          background: var(--cream);
          display: grid;
          grid-template-columns: 1fr;
          overflow: hidden;
          border-radius: var(--radius);
          box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.4);
        }
        @media (min-width: 480px) {
          .hero-feature-card {
            grid-template-columns: 200px 1fr;
          }
        }
        .hero-feature-img-wrap {
          position: relative;
          height: 220px;
        }
        @media (min-width: 480px) {
          .hero-feature-img-wrap {
            height: 280px;
          }
        }
        .hero-feature-img {
          object-fit: cover;
          object-position: center top;
        }
        .hero-feature-label {
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }
        .hero-feature-tag {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid var(--gold-light);
          padding: 3px 10px;
          width: fit-content;
        }
        .hero-feature-name {
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--forest);
          margin: 0;
        }
        .hero-feature-sub {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hero-cta {
          display: inline-block;
          margin-top: 8px;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--forest);
          border-bottom: 1px solid var(--forest);
          padding-bottom: 2px;
          text-decoration: none;
          width: fit-content;
          transition: color 0.2s, border-color 0.2s;
        }
        .hero-cta:hover {
          color: var(--gold);
          border-color: var(--gold);
        }

        /* ── Filters ── */
        .filters-bar {
          padding: 28px 24px 0;
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-start;
        }
        @media (min-width: 768px) {
          .filters-bar {
            padding: 40px 60px 0;
          }
        }
        .search-wrap {
          flex: 1;
          min-width: 220px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 36px;
          border: 1px solid #d9d0c3;
          background: var(--cream);
          border-radius: var(--radius);
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.9rem;
          color: var(--text);
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: var(--forest);
        }
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid #d9d0c3;
          background: var(--cream);
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.85rem;
          color: var(--text);
          cursor: pointer;
          border-radius: var(--radius);
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .filter-toggle.active,
        .filter-toggle:hover {
          background: var(--forest);
          color: var(--cream);
          border-color: var(--forest);
        }
        .filter-panel {
          width: 100%;
          background: var(--cream);
          border: 1px solid #d9d0c3;
          border-radius: var(--radius);
          padding: 20px 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .filter-group {
          border: none;
          padding: 0;
          margin: 0;
        }
        .filter-group legend {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pill {
          padding: 5px 14px;
          border: 1px solid #d9d0c3;
          background: white;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.15s;
        }
        .pill:hover { border-color: var(--forest); color: var(--forest); }
        .pill-active {
          background: var(--forest);
          border-color: var(--forest);
          color: var(--cream);
        }

        /* ── Grid ── */
        .recepten-grid-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }
        @media (min-width: 768px) {
          .recepten-grid-section {
            padding: 40px 60px 80px;
          }
        }
        .results-count {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin: 0 0 24px;
        }
        .empty-state {
          text-align: center;
          padding: 80px 24px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
        .recepten-grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 600px) {
          .recepten-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 960px) {
          .recepten-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* ── Card ── */
        .recept-card {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-inner {
          display: block;
          text-decoration: none;
          color: inherit;
          background: white;
          border: 1px solid #e8e0d4;
          border-radius: var(--radius);
          overflow: hidden;
          transition: box-shadow 0.25s, transform 0.25s;
          height: 100%;
        }
        .card-inner:not(.premium):hover {
          box-shadow: 0 12px 40px rgba(28, 58, 42, 0.12);
          transform: translateY(-3px);
        }
        .card-inner:not(.premium):hover .card-hover-poster {
          opacity: 1;
        }

        .card-img-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: var(--cream);
        }
        .card-img {
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .card-inner:hover .card-img:first-child {
          transform: scale(1.03);
        }

        /* Poster hover overlay */
        .card-hover-poster {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .card-blur-overlay {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(6px);
          background: rgba(28, 58, 42, 0.3);
        }
        .premium-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--forest);
          color: var(--gold-light);
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid var(--gold);
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .difficulty-tag {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 2px;
          width: fit-content;
          font-weight: 500;
        }
        .card-title {
          font-size: 1.2rem;
          font-weight: 400;
          margin: 4px 0 0;
          color: var(--forest);
          line-height: 1.2;
        }
        .card-sub {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          color: var(--gold);
          margin: 0;
          letter-spacing: 0.05em;
          font-style: italic;
        }
        .card-teaser {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 4px 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-meta {
          display: flex;
          gap: 14px;
          margin-top: 4px;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .card-cta {
          display: inline-block;
          margin-top: 10px;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--forest);
          border-bottom: 1px solid currentColor;
          padding-bottom: 1px;
        }
        .card-cta-premium {
          display: block;
          margin-top: 12px;
          padding: 9px 16px;
          background: var(--forest);
          color: var(--gold-light);
          text-decoration: none;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          border: 1px solid var(--gold);
          transition: background 0.2s;
        }
        .card-cta-premium:hover {
          background: var(--forest-mid);
        }

        /* ── Premium banner ── */
        .premium-banner {
          position: relative;
          background: var(--forest);
          overflow: hidden;
        }
        .premium-banner-deco {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 30px,
              rgba(201, 168, 76, 0.04) 30px,
              rgba(201, 168, 76, 0.04) 31px
            );
        }
        .premium-banner-content {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
          color: var(--cream);
        }
        @media (min-width: 768px) {
          .premium-banner-content {
            flex-direction: row;
            align-items: center;
            padding: 60px 60px;
            gap: 32px;
          }
        }
        .premium-banner-content svg {
          flex-shrink: 0;
          color: var(--gold);
        }
        .premium-banner-content h2 {
          font-size: 1.5rem;
          font-weight: 400;
          margin: 0 0 6px;
          color: var(--cream);
        }
        .premium-banner-content p {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.9rem;
          color: rgba(248, 244, 237, 0.7);
          margin: 0;
          line-height: 1.6;
        }
        .banner-cta {
          flex-shrink: 0;
          padding: 12px 28px;
          background: var(--gold);
          color: var(--forest);
          text-decoration: none;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.82rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          border: none;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .banner-cta:hover {
          background: var(--gold-light);
        }
      `}</style>
    </div>
  );
}