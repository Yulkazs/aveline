"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  List,
  Map,
  Loader2,
  Store,
  ShoppingBag,
  Hammer,
  ChevronRight,
  X,
  LocateFixed,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LocationType = "STORE" | "MARKET_STALL" | "WORKSHOP";

interface Winkel {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  openingHours: Record<string, string>;
  distance?: number; // km, berekend op basis van gebruikerslocatie
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const WINKELS: Winkel[] = [
  {
    id: "1",
    name: "Avéline Utrecht",
    type: "STORE",
    address: "Oudegracht 158",
    city: "Utrecht",
    country: "Nederland",
    latitude: 52.0907,
    longitude: 5.1214,
    phone: "+31 30 123 4567",
    openingHours: {
      Maandag: "10:00 – 18:00",
      Dinsdag: "10:00 – 18:00",
      Woensdag: "10:00 – 18:00",
      Donderdag: "10:00 – 20:00",
      Vrijdag: "10:00 – 20:00",
      Zaterdag: "09:00 – 18:00",
      Zondag: "11:00 – 17:00",
    },
  },
  {
    id: "2",
    name: "Avéline Istanbul",
    type: "STORE",
    address: "İstiklal Caddesi 247",
    city: "Istanbul",
    country: "Turkije",
    latitude: 41.0337,
    longitude: 28.9774,
    phone: "+90 212 345 6789",
    openingHours: {
      Maandag: "10:00 – 21:00",
      Dinsdag: "10:00 – 21:00",
      Woensdag: "10:00 – 21:00",
      Donderdag: "10:00 – 21:00",
      Vrijdag: "10:00 – 22:00",
      Zaterdag: "09:00 – 22:00",
      Zondag: "10:00 – 20:00",
    },
  },
  {
    id: "3",
    name: "Avéline Dubai",
    type: "STORE",
    address: "Dubai Mall, Fashion Avenue",
    city: "Dubai",
    country: "VAE",
    latitude: 25.1972,
    longitude: 55.2744,
    phone: "+971 4 567 8901",
    openingHours: {
      Maandag: "10:00 – 22:00",
      Dinsdag: "10:00 – 22:00",
      Woensdag: "10:00 – 22:00",
      Donderdag: "10:00 – 22:00",
      Vrijdag: "14:00 – 00:00",
      Zaterdag: "10:00 – 00:00",
      Zondag: "10:00 – 22:00",
    },
  },
  {
    id: "4",
    name: "Avéline New York",
    type: "STORE",
    address: "425 West Broadway",
    city: "New York",
    country: "Verenigde Staten",
    latitude: 40.7249,
    longitude: -74.0018,
    phone: "+1 212 987 6543",
    openingHours: {
      Maandag: "09:00 – 19:00",
      Dinsdag: "09:00 – 19:00",
      Woensdag: "09:00 – 19:00",
      Donderdag: "09:00 – 20:00",
      Vrijdag: "09:00 – 20:00",
      Zaterdag: "10:00 – 20:00",
      Zondag: "11:00 – 18:00",
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatAfstand(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

const TYPE_ICON: Record<LocationType, typeof Store> = {
  STORE: Store,
  MARKET_STALL: ShoppingBag,
  WORKSHOP: Hammer,
};

const TYPE_LABEL: Record<LocationType, string> = {
  STORE: "Winkel",
  MARKET_STALL: "Marktkraam",
  WORKSHOP: "Workshop",
};

function isNuOpen(hours: Record<string, string>): boolean | null {
  const dagen = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];
  const dag = dagen[new Date().getDay()];
  const tijden = hours[dag];
  if (!tijden || tijden === "Gesloten") return false;
  const [open, sluit] = tijden.split(" – ");
  if (!open || !sluit) return null;
  const now = new Date();
  const [oh, om] = open.split(":").map(Number);
  const [sh, sm] = sluit.split(":").map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= oh * 60 + om && nowMin < sh * 60 + sm;
}

function getMapsUrl(winkel: Winkel): string {
  const query = encodeURIComponent(`${winkel.address}, ${winkel.city}`);
  return `https://maps.google.com/?q=${query}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WinkelzoekePage() {
  const [weergave, setWeergave] = useState<"lijst" | "kaart">("lijst");
  const [geselecteerd, setGeselecteerd] = useState<Winkel | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Winkels gesorteerd op afstand als locatie bekend is
  const winkels = WINKELS.map((w) => ({
    ...w,
    distance:
      userLat !== null && userLon !== null
        ? haversineKm(userLat, userLon, w.latitude, w.longitude)
        : undefined,
  })).sort((a, b) =>
    a.distance !== undefined && b.distance !== undefined
      ? a.distance - b.distance
      : 0
  );

  const vraagLocatie = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocatie wordt niet ondersteund door uw browser.");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        setLocLoading(false);
      },
      () => {
        setLocError("Kon uw locatie niet bepalen. Controleer de browserinstellingen.");
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // Vraag locatie automatisch bij het laden
  useEffect(() => {
    vraagLocatie();
  }, [vraagLocatie]);

  return (
    <div className="page">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <p className="eyebrow">Avéline</p>
          <h1 className="title">Onze Winkels</h1>
          <p className="desc">
            Vier locaties wereldwijd — vind de winkel bij u in de buurt.
          </p>

          {/* Locatie + weergave controls */}
          <div className="controls">
            <button
              className={`loc-btn ${locLoading ? "loading" : ""} ${userLat ? "active" : ""}`}
              onClick={vraagLocatie}
              disabled={locLoading}
            >
              {locLoading ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <LocateFixed size={14} />
              )}
              {userLat
                ? "Locatie actief"
                : locLoading
                ? "Locatie zoeken…"
                : "Gebruik mijn locatie"}
            </button>

            <div className="view-toggle">
              <button
                className={`toggle-btn ${weergave === "lijst" ? "on" : ""}`}
                onClick={() => setWeergave("lijst")}
                aria-label="Lijstweergave"
              >
                <List size={15} />
              </button>
              <button
                className={`toggle-btn ${weergave === "kaart" ? "on" : ""}`}
                onClick={() => setWeergave("kaart")}
                aria-label="Kaartweergave"
              >
                <Map size={15} />
              </button>
            </div>
          </div>

          {locError && (
            <p className="loc-error">
              <X size={12} /> {locError}
            </p>
          )}
        </div>
      </header>

      {/* ── Kaartweergave (vereenvoudigd) ── */}
      {weergave === "kaart" && (
        <div className="map-container">
          <div className="map-placeholder">
            <MapPin size={32} strokeWidth={1} className="map-pin-icon" />
            <p className="map-placeholder-title">Kaartweergave</p>
            <p className="map-placeholder-desc">
              Integreer hier Google Maps of Mapbox met de coördinaten uit de
              winkels array. Klik een marker aan om de detailkaart te openen.
            </p>
            {/* Mini locatie-pills als visuele hint */}
            <div className="map-pills">
              {winkels.map((w) => {
                const Icon = TYPE_ICON[w.type];
                return (
                  <button
                    key={w.id}
                    className="map-pill"
                    onClick={() => { setGeselecteerd(w); setWeergave("lijst"); }}
                  >
                    <Icon size={11} />
                    {w.city}
                    {w.distance !== undefined && (
                      <span className="map-pill-dist">
                        {formatAfstand(w.distance)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Lijstweergave ── */}
      {weergave === "lijst" && (
        <main className="main">
          {userLat && (
            <p className="sort-note">
              Gesorteerd op afstand van uw locatie
            </p>
          )}

          <ul className="winkel-list">
            {winkels.map((w, i) => {
              const Icon = TYPE_ICON[w.type];
              const open = isNuOpen(w.openingHours);
              return (
                <li
                  key={w.id}
                  className={`winkel-item ${geselecteerd?.id === w.id ? "expanded" : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* ── Kaart header (klikbaar) ── */}
                  <button
                    className="winkel-header"
                    onClick={() =>
                      setGeselecteerd(geselecteerd?.id === w.id ? null : w)
                    }
                    aria-expanded={geselecteerd?.id === w.id}
                  >
                    <div className="winkel-icon-wrap">
                      <Icon size={18} strokeWidth={1.5} className="winkel-icon" />
                    </div>

                    <div className="winkel-summary">
                      <div className="winkel-name-row">
                        <span className="winkel-name">{w.name}</span>
                        <span className={`open-badge ${open === true ? "open" : open === false ? "closed" : ""}`}>
                          {open === true ? "Nu open" : open === false ? "Gesloten" : ""}
                        </span>
                      </div>
                      <p className="winkel-address">
                        {w.address}, {w.city} — {w.country}
                      </p>
                      <div className="winkel-meta-row">
                        <span className="type-tag">
                          <Icon size={10} /> {TYPE_LABEL[w.type]}
                        </span>
                        {w.distance !== undefined && (
                          <span className="distance-tag">
                            <Navigation size={10} />
                            {formatAfstand(w.distance)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className={`chevron ${geselecteerd?.id === w.id ? "open" : ""}`}
                    />
                  </button>

                  {/* ── Uitklapbaar detail ── */}
                  {geselecteerd?.id === w.id && (
                    <div className="winkel-detail">
                      <div className="detail-grid">

                        {/* Openingstijden */}
                        <section className="detail-section">
                          <h3 className="detail-heading">
                            <Clock size={13} /> Openingstijden
                          </h3>
                          <ul className="hours-list">
                            {Object.entries(w.openingHours).map(([dag, tijd]) => {
                              const vandaag = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"][new Date().getDay()];
                              return (
                                <li key={dag} className={`hours-row ${dag === vandaag ? "today" : ""}`}>
                                  <span className="hours-day">{dag}</span>
                                  <span className="hours-time">{tijd}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </section>

                        {/* Contact + Route */}
                        <section className="detail-section">
                          <h3 className="detail-heading">
                            <Phone size={13} /> Contact
                          </h3>
                          <a href={`tel:${w.phone}`} className="phone-link">
                            {w.phone}
                          </a>

                          <div className="action-buttons">
                            <a
                              href={getMapsUrl(w)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="route-btn"
                            >
                              <Navigation size={14} />
                              Route plannen
                            </a>
                            {w.distance !== undefined && (
                              <span className="dist-display">
                                {formatAfstand(w.distance)} van u
                              </span>
                            )}
                          </div>

                          {/* Mini coordinaten kaart placeholder */}
                          <div className="mini-map">
                            <MapPin size={20} strokeWidth={1} className="mini-pin" />
                            <span className="mini-map-label">
                              {w.latitude.toFixed(4)}°, {w.longitude.toFixed(4)}°
                            </span>
                          </div>
                        </section>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </main>
      )}

      {/* ── Styles ── */}
      <style jsx>{`
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

        /* ── Header ── */
        .header {
          background: var(--forest);
          padding: 40px 20px 32px;
        }
        @media (min-width: 768px) {
          .header { padding: 56px 48px 40px; }
        }
        .header-inner {
          max-width: 800px;
          margin: 0 auto;
        }
        .eyebrow {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 10px;
        }
        .title {
          font-size: clamp(2rem, 8vw, 3.2rem);
          font-weight: 400;
          color: var(--cream);
          margin: 0 0 12px;
          line-height: 1.05;
        }
        .desc {
          font-family: var(--sans);
          font-size: 0.9rem;
          color: rgba(248,244,237,0.6);
          line-height: 1.6;
          margin: 0 0 24px;
          max-width: 380px;
        }

        /* Controls */
        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .loc-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.35);
          color: var(--gold-light);
          font-family: var(--sans);
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .loc-btn.active {
          background: rgba(201,168,76,0.2);
          border-color: var(--gold);
          color: var(--gold);
        }
        .loc-btn:hover:not(:disabled) {
          background: rgba(201,168,76,0.2);
        }
        .loc-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .view-toggle {
          display: flex;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 2px;
          overflow: hidden;
          margin-left: auto;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: transparent;
          border: none;
          color: rgba(248,244,237,0.4);
          cursor: pointer;
          transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .toggle-btn + .toggle-btn {
          border-left: 1px solid rgba(201,168,76,0.3);
        }
        .toggle-btn.on {
          background: rgba(201,168,76,0.15);
          color: var(--gold);
        }

        .loc-error {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 12px 0 0;
          font-family: var(--sans);
          font-size: 0.78rem;
          color: rgba(248,100,80,0.85);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* ── Kaart placeholder ── */
        .map-container {
          height: clamp(280px, 45vw, 480px);
          background: var(--forest);
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(201,168,76,0.2);
        }
        .map-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px 24px;
          /* Gestileerde kaart-achtergrond */
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(201,168,76,0.05) 39px,
              rgba(201,168,76,0.05) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 39px,
              rgba(201,168,76,0.05) 39px,
              rgba(201,168,76,0.05) 40px
            ),
            radial-gradient(ellipse at 30% 50%, rgba(42,80,64,0.6) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 50%, rgba(42,80,64,0.4) 0%, transparent 60%),
            var(--forest);
        }
        .map-pin-icon { color: var(--gold); opacity: 0.6; }
        .map-placeholder-title {
          font-size: 1.1rem;
          color: var(--cream);
          margin: 0;
          font-weight: 400;
        }
        .map-placeholder-desc {
          font-family: var(--sans);
          font-size: 0.78rem;
          color: rgba(248,244,237,0.45);
          text-align: center;
          max-width: 320px;
          margin: 0;
          line-height: 1.55;
        }
        .map-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }
        .map-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.3);
          color: var(--gold-light);
          font-family: var(--sans);
          font-size: 0.75rem;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .map-pill:hover { background: rgba(201,168,76,0.2); }
        .map-pill-dist {
          color: rgba(232,212,154,0.5);
          font-size: 0.68rem;
          margin-left: 2px;
        }

        /* ── Lijst ── */
        .main {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px 20px 80px;
        }
        @media (min-width: 768px) {
          .main { padding: 32px 48px 80px; }
        }

        .sort-note {
          font-family: var(--sans);
          font-size: 0.72rem;
          color: var(--muted);
          letter-spacing: 0.06em;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .winkel-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
          border: 1px solid var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        /* ── Winkel item ── */
        .winkel-item {
          background: var(--warm-white);
          animation: fadeUp 0.4s ease both;
          transition: background 0.15s;
        }
        .winkel-item + .winkel-item {
          border-top: 1px solid var(--border);
        }
        .winkel-item.expanded {
          background: var(--cream);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Header-knop */
        .winkel-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 16px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }
        .winkel-header:hover { background: rgba(28,58,42,0.03); }

        .winkel-icon-wrap {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: var(--forest);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .winkel-icon { color: var(--gold); }

        .winkel-summary { flex: 1; min-width: 0; }

        .winkel-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 3px;
        }
        .winkel-name {
          font-size: 1rem;
          font-weight: 400;
          color: var(--text);
        }

        .open-badge {
          font-family: var(--sans);
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 2px;
        }
        .open-badge.open {
          background: rgba(5,150,105,0.1);
          color: #059669;
          border: 1px solid rgba(5,150,105,0.25);
        }
        .open-badge.closed {
          background: rgba(180,83,9,0.08);
          color: #b45309;
          border: 1px solid rgba(180,83,9,0.2);
        }

        .winkel-address {
          font-family: var(--sans);
          font-size: 0.8rem;
          color: var(--muted);
          margin: 0 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .winkel-meta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .type-tag,
        .distance-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--sans);
          font-size: 0.72rem;
          color: var(--muted);
        }
        .distance-tag {
          color: var(--gold);
          font-weight: 600;
        }

        .chevron {
          flex-shrink: 0;
          color: var(--muted);
          transition: transform 0.25s ease;
        }
        .chevron.open { transform: rotate(90deg); }

        /* ── Detail uitklap ── */
        .winkel-detail {
          border-top: 1px solid var(--border);
          padding: 20px 16px 24px;
          animation: slideDown 0.25s ease both;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          .winkel-detail { padding: 24px 20px 28px; }
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 560px) {
          .detail-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }

        .detail-section {}
        .detail-heading {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 12px;
          font-weight: 400;
        }

        /* Openingstijden */
        .hours-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hours-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid rgba(224,213,197,0.5);
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--muted);
        }
        .hours-row.today {
          color: var(--text);
          font-weight: 600;
        }
        .hours-row.today .hours-day::before {
          content: "▸ ";
          color: var(--gold);
          font-size: 0.65rem;
        }
        .hours-day {}
        .hours-time { text-align: right; }

        /* Contact */
        .phone-link {
          display: block;
          font-family: var(--sans);
          font-size: 0.9rem;
          color: var(--forest);
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.15s;
        }
        .phone-link:hover { color: var(--gold); }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .route-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          background: var(--forest);
          color: var(--gold-light);
          text-decoration: none;
          font-family: var(--sans);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid var(--gold);
          border-radius: 2px;
          transition: background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .route-btn:hover { background: var(--forest-mid); }

        .dist-display {
          font-family: var(--sans);
          font-size: 0.78rem;
          color: var(--gold);
          font-weight: 600;
        }

        /* Mini map placeholder */
        .mini-map {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--forest);
          border-radius: 2px;
          margin-top: 4px;
        }
        .mini-pin { color: var(--gold); flex-shrink: 0; }
        .mini-map-label {
          font-family: var(--sans);
          font-size: 0.72rem;
          color: rgba(248,244,237,0.5);
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}