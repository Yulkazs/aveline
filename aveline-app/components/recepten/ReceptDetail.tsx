"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  ChefHat,
  Users,
  Leaf,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

interface Stap {
  nummer: number;
  titel: string;
  beschrijving: string;
  duur?: number; // minuten
}

interface Recept {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "makkelijk" | "gemiddeld" | "moeilijk";
  flavor: string;
  duur: number;
  porties: number;
  isPremium: boolean;
  imageUrl: string;
  posterUrl: string;
  product: string;
  productSlug: string;
  teaser: string;
  intro: string;
  certificeringen: string[];
  ingredienten: Ingredient[];
  stappen: Stap[];
  tip?: string;
  videoUrl?: string;
}

interface ReceptDetailProps {
  recept: Recept;
}

// ─── Voorbeeld data (in productie: server component met DB fetch) ───────────────
export const VOORBEELD_RECEPT: Recept = {
  id: "1",
  slug: "chocolade-fondant",
  title: "Chocolade Fondant",
  subtitle: "Klassiek & onweerstaanbaar",
  difficulty: "gemiddeld",
  flavor: "puur",
  duur: 35,
  porties: 4,
  isPremium: false,
  imageUrl: "/chocolates/choco.png",
  posterUrl: "/marketing/MilkChocolatePoster1.png",
  product: "Melkchocolade",
  productSlug: "melkchocolade",
  teaser:
    "Een romige kern van gesmolten Avéline melkchocolade, omhuld door een perfect gegaard buitenlaagje.",
  intro:
    "Deze fondant is het bewijs dat eenvoud en luxe hand in hand gaan. Met de rijke Avéline melkchocolade — afkomstig uit duurzame Ghanese cacaoplantages — bereik je een resultaat dat iedere patisserie waardig is. Laat de chocolade spreken.",
  certificeringen: ["Fairtrade", "Rainforest Alliance"],
  ingredienten: [
    { amount: "150", unit: "g", name: "Avéline melkchocolade (fijngehakt)" },
    { amount: "100", unit: "g", name: "ongezouten boter" },
    { amount: "3", unit: "stuks", name: "eieren (M)" },
    { amount: "3", unit: "stuks", name: "eierdooiers" },
    { amount: "80", unit: "g", name: "fijne kristalsuiker" },
    { amount: "40", unit: "g", name: "bloem (gezeefd)" },
    { amount: "1", unit: "snuf", name: "fleur de sel" },
  ],
  stappen: [
    {
      nummer: 1,
      titel: "Verwarm de oven",
      beschrijving:
        "Verwarm de oven voor op 200 °C (hetelucht 185 °C). Vet vier ramekins (Ø 8 cm) in met boter en bestrooi met cacaopoeder. Tik het overtollige poeder eruit.",
      duur: 10,
    },
    {
      nummer: 2,
      titel: "Smelt chocolade & boter",
      beschrijving:
        "Smelt de fijngehakte Avéline chocolade samen met de boter au bain-marie. Roer regelmatig tot de massa glanzend en homogeen is. Haal van het vuur en laat iets afkoelen.",
      duur: 8,
    },
    {
      nummer: 3,
      titel: "Klop eieren en suiker",
      beschrijving:
        "Klop de eieren, eierdooiers en suiker 4–5 minuten bleekgeel en luchtig op met een handmixer of keukenmachine. Het volume moet minstens verdubbelen.",
      duur: 5,
    },
    {
      nummer: 4,
      titel: "Combineer",
      beschrijving:
        "Spatel de chocolade-botermix voorzichtig door het eiermengsel. Zeef de bloem erboven en vouw alles tot een egale massa — niet te lang roeren om de lucht te bewaren.",
    },
    {
      nummer: 5,
      titel: "Bakken",
      beschrijving:
        "Verdeel het beslag gelijkmatig over de ramekins (±¾ vol). Bak 10–12 minuten: de randen zijn gaar, het midden voelt nog licht zacht aan. Dit is het geheim van de vloeibare kern.",
      duur: 12,
    },
    {
      nummer: 6,
      titel: "Serveren",
      beschrijving:
        "Laat 1 minuut rusten, los dan de rand met een mes en keer de fondant op een warm bord. Bestrooi direct met fleur de sel en serveer met een bolletje vanille-ijs of slagroom.",
    },
  ],
  tip: "De ramekins kunnen tot 24 uur van tevoren gevuld worden en in de koelkast bewaard. Voeg dan 2–3 minuten extra baktijd toe.",
};

// ─── Component ────────────────────────────────────────────────────────────────
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

export default function ReceptDetail({ recept }: ReceptDetailProps) {
  const [voltooideStappen, setVoltooideStappen] = useState<Set<number>>(
    new Set()
  );

  function toggleStap(nr: number) {
    setVoltooideStappen((prev) => {
      const next = new Set(prev);
      if (next.has(nr)) next.delete(nr);
      else next.add(nr);
      return next;
    });
  }

  const voortgang = Math.round(
    (voltooideStappen.size / recept.stappen.length) * 100
  );

  if (recept.isPremium) {
    return <PremiumWall recept={recept} />;
  }

  return (
    <div className="detail-page">
      {/* ── Terug ── */}
      <div className="back-bar">
        <div className="back-inner">
          <Link href="/recepten" className="back-link">
            <ArrowLeft size={14} />
            Alle recepten
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <header className="detail-hero">
        <div className="detail-hero-img-wrap">
          {recept.posterUrl && (
            <Image
              src={recept.posterUrl}
              alt={recept.title}
              fill
              className="detail-hero-img"
              sizes="100vw"
              priority
            />
          )}
          <div className="detail-hero-gradient" />
        </div>
        <div className="detail-hero-content">
          <span
            className="detail-difficulty"
            style={{ color: difficultyColor[recept.difficulty] }}
          >
            {difficultyLabel[recept.difficulty]}
          </span>
          <h1 className="detail-title">{recept.title}</h1>
          <p className="detail-subtitle">{recept.subtitle}</p>
          <div className="detail-stats">
            <div className="stat">
              <Clock size={16} strokeWidth={1.5} />
              <span>{recept.duur} min</span>
            </div>
            <div className="stat">
              <Users size={16} strokeWidth={1.5} />
              <span>{recept.porties} personen</span>
            </div>
            <div className="stat">
              <ChefHat size={16} strokeWidth={1.5} />
              <span>{difficultyLabel[recept.difficulty]}</span>
            </div>
          </div>
          {/* Certificeringen */}
          <div className="certs">
            {recept.certificeringen.map((c) => (
              <span key={c} className="cert-badge">
                <Leaf size={11} />
                {c}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Inhoud ── */}
      <div className="detail-body">
        {/* Intro */}
        <section className="intro-section">
          <p className="intro-text">{recept.intro}</p>
          <div className="product-link-wrap">
            <div className="product-img-wrap">
              {recept.imageUrl && (
                <Image
                  src={recept.imageUrl}
                  alt={recept.product ?? ""}
                  fill
                  className="product-img"
                  sizes="80px"
                />
              )}
            </div>
            <div>
              <p className="product-label">Gebruikte chocolade</p>
              <Link
                href={`/scan?product=${recept.productSlug}`}
                className="product-name"
              >
                Avéline {recept.product}
              </Link>
              <p className="product-hint">Scan de QR-code voor herkomstinfo →</p>
            </div>
          </div>
        </section>

        <div className="two-col">
          {/* Ingrediënten */}
          <section className="ingredienten-section">
            <h2 className="section-heading">Ingrediënten</h2>
            <p className="portie-note">voor {recept.porties} personen</p>
            <ul className="ingredienten-list">
              {recept.ingredienten.map((ing, i) => (
                <li key={i} className="ingredienten-item">
                  <span className="ing-amount">
                    {ing.amount} {ing.unit}
                  </span>
                  <span className="ing-name">{ing.name}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Stappen */}
          <section className="stappen-section">
            <div className="stappen-header">
              <h2 className="section-heading">Bereiding</h2>
              {voltooideStappen.size > 0 && (
                <span className="progress-label">{voortgang}% voltooid</span>
              )}
            </div>
            {voltooideStappen.size > 0 && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${voortgang}%` }}
                />
              </div>
            )}
            <ol className="stappen-list">
              {recept.stappen.map((stap) => {
                const done = voltooideStappen.has(stap.nummer);
                return (
                  <li
                    key={stap.nummer}
                    className={`stap-item ${done ? "done" : ""}`}
                    onClick={() => toggleStap(stap.nummer)}
                  >
                    <div className="stap-check">
                      {done ? (
                        <CheckCircle2 size={20} strokeWidth={1.5} />
                      ) : (
                        <span className="stap-nr">{stap.nummer}</span>
                      )}
                    </div>
                    <div className="stap-content">
                      <div className="stap-meta">
                        <strong className="stap-titel">{stap.titel}</strong>
                        {stap.duur && (
                          <span className="stap-duur">
                            <Clock size={11} /> {stap.duur} min
                          </span>
                        )}
                      </div>
                      <p className="stap-beschrijving">{stap.beschrijving}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Tip */}
        {recept.tip && (
          <div className="tip-box">
            <span className="tip-label">Avéline Tip</span>
            <p className="tip-text">{recept.tip}</p>
          </div>
        )}

        {/* Premium upsell */}
        <div className="upsell-bar">
          <Lock size={16} strokeWidth={1.5} />
          <p>
            Geniet van <strong>exclusieve video-tutorials</strong> en premium
            recepten met een gratis Avéline account.
          </p>
          <Link href="/register" className="upsell-cta">
            Registreer gratis
          </Link>
        </div>
      </div>

      {/* ── Styles ── */}
      <style jsx>{`
        .detail-page {
          --forest: #1c3a2a;
          --forest-mid: #2a5040;
          --gold: #c9a84c;
          --gold-light: #e8d49a;
          --cream: #f8f4ed;
          --warm-white: #fffdf8;
          --text: #1a1a18;
          --text-muted: #6b6255;

          background: var(--warm-white);
          color: var(--text);
          font-family: "Georgia", "Times New Roman", serif;
          min-height: 100vh;
        }

        /* ── Terug ── */
        .back-bar {
          background: var(--forest);
          padding: 0 24px;
        }
        @media (min-width: 768px) { .back-bar { padding: 0 60px; } }
        .back-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 0;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(248,244,237,0.6);
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--gold); }

        /* ── Hero ── */
        .detail-hero {
          position: relative;
          height: clamp(300px, 55vw, 520px);
          overflow: hidden;
        }
        .detail-hero-img-wrap {
          position: absolute;
          inset: 0;
        }
        .detail-hero-img {
          object-fit: cover;
          object-position: center 20%;
        }
        .detail-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(14, 30, 20, 0.92) 0%,
            rgba(14, 30, 20, 0.3) 50%,
            transparent 100%
          );
        }
        .detail-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 40px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .detail-hero-content { padding: 60px 60px; }
        }
        .detail-difficulty {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 600;
          display: block;
          margin-bottom: 10px;
        }
        .detail-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 6px;
          line-height: 1.05;
        }
        .detail-subtitle {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          color: var(--gold);
          font-style: italic;
          font-size: 1rem;
          margin: 0 0 20px;
        }
        .detail-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          color: rgba(248,244,237,0.75);
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.85rem;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .certs {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .cert-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border: 1px solid rgba(201,168,76,0.4);
          color: var(--gold-light);
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        /* ── Body ── */
        .detail-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }
        @media (min-width: 768px) {
          .detail-body { padding: 60px 60px 100px; }
        }

        /* Intro */
        .intro-section {
          display: flex;
          flex-direction: column;
          gap: 28px;
          margin-bottom: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid #e8e0d4;
        }
        @media (min-width: 640px) {
          .intro-section {
            flex-direction: row;
            align-items: flex-start;
          }
        }
        .intro-text {
          flex: 1;
          font-size: 1.05rem;
          line-height: 1.8;
          color: var(--text);
          margin: 0;
        }
        .product-link-wrap {
          display: flex;
          gap: 14px;
          align-items: center;
          background: var(--cream);
          border: 1px solid #e0d5c5;
          padding: 16px;
          min-width: 220px;
          border-left: 3px solid var(--gold);
        }
        .product-img-wrap {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
          border-radius: 2px;
          overflow: hidden;
        }
        .product-img { object-fit: cover; }
        .product-label {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 4px;
        }
        .product-name {
          font-size: 0.95rem;
          color: var(--forest);
          text-decoration: none;
          font-weight: 400;
          display: block;
        }
        .product-name:hover { color: var(--gold); }
        .product-hint {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 4px 0 0;
        }

        /* Two-col layout */
        .two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        @media (min-width: 768px) {
          .two-col {
            grid-template-columns: 280px 1fr;
            gap: 64px;
          }
        }

        /* Ingrediënten */
        .section-heading {
          font-size: 1.3rem;
          font-weight: 400;
          color: var(--forest);
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .portie-note {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin: 0 0 20px;
        }
        .ingredienten-list {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid #e8e0d4;
        }
        .ingredienten-item {
          display: flex;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid #e8e0d4;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.9rem;
        }
        .ing-amount {
          min-width: 80px;
          color: var(--gold);
          font-variant-numeric: tabular-nums;
        }
        .ing-name { color: var(--text); }

        /* Stappen */
        .stappen-header {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 6px;
        }
        .progress-label {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          color: var(--gold);
          letter-spacing: 0.05em;
        }
        .progress-bar {
          height: 2px;
          background: #e8e0d4;
          margin-bottom: 24px;
          border-radius: 1px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--gold);
          transition: width 0.4s ease;
        }
        .stappen-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .stap-item {
          display: flex;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid #e8e0d4;
          cursor: pointer;
          transition: background 0.15s;
          border-radius: 2px;
        }
        .stap-item.done .stap-content {
          opacity: 0.45;
        }
        .stap-item.done .stap-check {
          color: var(--gold);
        }
        .stap-check {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .stap-nr {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--forest);
          background: var(--cream);
          border: 1px solid #e8e0d4;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stap-content { flex: 1; }
        .stap-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .stap-titel {
          font-size: 0.95rem;
          font-weight: 600;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          color: var(--forest);
        }
        .stap-duur {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .stap-beschrijving {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0;
        }

        /* Tip */
        .tip-box {
          background: var(--forest);
          padding: 24px 28px;
          margin-bottom: 40px;
          border-left: 4px solid var(--gold);
        }
        .tip-label {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          display: block;
          margin-bottom: 8px;
        }
        .tip-text {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.9rem;
          color: rgba(248,244,237,0.85);
          line-height: 1.6;
          margin: 0;
          font-style: italic;
        }

        /* Upsell */
        .upsell-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
          border: 1px solid #e0d5c5;
          background: var(--cream);
          align-items: flex-start;
        }
        @media (min-width: 640px) {
          .upsell-bar {
            flex-direction: row;
            align-items: center;
          }
        }
        .upsell-bar svg {
          flex-shrink: 0;
          color: var(--gold);
          margin-top: 2px;
        }
        .upsell-bar p {
          flex: 1;
          margin: 0;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .upsell-bar strong { color: var(--forest); }
        .upsell-cta {
          flex-shrink: 0;
          padding: 10px 22px;
          background: var(--forest);
          color: var(--gold-light);
          text-decoration: none;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid var(--gold);
          transition: background 0.2s;
          white-space: nowrap;
        }
        .upsell-cta:hover { background: var(--forest-mid); }
      `}</style>
    </div>
  );
}

// ─── Premium wall ──────────────────────────────────────────────────────────────
function PremiumWall({ recept }: { recept: Recept }) {
  return (
    <div className="premium-wall">
      <div className="pw-img-wrap">
        {recept.posterUrl && (
          <Image
            src={recept.posterUrl}
            alt={recept.title}
            fill
            className="pw-img"
            sizes="100vw"
            priority
          />
        )}
        <div className="pw-blur" />
      </div>
      <div className="pw-content">
        <Lock size={32} strokeWidth={1} className="pw-icon" />
        <h1 className="pw-title">{recept.title}</h1>
        <p className="pw-sub">{recept.teaser}</p>
        <p className="pw-msg">
          Dit is een premium recept. Maak een gratis account aan om toegang te
          krijgen tot alle exclusieve bereidingen en video-tutorials.
        </p>
        <div className="pw-actions">
          <Link href="/register" className="pw-cta-main">
            Gratis registreren
          </Link>
          <Link href="/recepten" className="pw-cta-sec">
            ← Terug naar recepten
          </Link>
        </div>
      </div>
      <style jsx>{`
        .premium-wall {
          --forest: #1c3a2a;
          --gold: #c9a84c;
          --gold-light: #e8d49a;
          --cream: #f8f4ed;
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Georgia", "Times New Roman", serif;
        }
        .pw-img-wrap {
          position: fixed;
          inset: 0;
        }
        .pw-img {
          object-fit: cover;
        }
        .pw-blur {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(12px);
          background: rgba(14, 28, 20, 0.7);
        }
        .pw-content {
          position: relative;
          text-align: center;
          padding: 60px 24px;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .pw-icon { color: var(--gold); }
        .pw-title {
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0;
        }
        .pw-sub {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          color: var(--gold);
          font-style: italic;
          margin: 0;
        }
        .pw-msg {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.9rem;
          color: rgba(248,244,237,0.75);
          line-height: 1.6;
          margin: 0;
        }
        .pw-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin-top: 8px;
        }
        .pw-cta-main {
          padding: 14px 32px;
          background: var(--gold);
          color: var(--forest);
          text-decoration: none;
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.82rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
          text-align: center;
        }
        .pw-cta-sec {
          font-family: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;
          font-size: 0.8rem;
          color: rgba(248,244,237,0.55);
          text-decoration: none;
          letter-spacing: 0.08em;
        }
        .pw-cta-sec:hover { color: var(--gold); }
      `}</style>
    </div>
  );
}