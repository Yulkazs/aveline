"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
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
  distance?: number;
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
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  const dagen = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
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
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const winkels = WINKELS.map((w) => ({
    ...w,
    distance:
      userLat !== null && userLon !== null
        ? haversineKm(userLat, userLon, w.latitude, w.longitude)
        : undefined,
  })).sort((a, b) =>
    a.distance !== undefined && b.distance !== undefined ? a.distance - b.distance : 0
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
        setLocError("Kon uw locatie niet bepalen.");
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    vraagLocatie();
  }, [vraagLocatie]);

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
          Avéline
        </p>
        <h1
          className="font-display font-semibold leading-tight"
          style={{ fontSize: "clamp(1.75rem, 6vw, 2.25rem)", color: "#122A1A" }}
        >
          Onze Winkels
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B7F73" }}>
          Vier locaties wereldwijd — vind de winkel bij u in de buurt.
        </p>

        {/* Locatie knop */}
        <button
          onClick={vraagLocatie}
          disabled={locLoading}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
          style={{
            background: userLat ? "#EFF5EE" : "#304C3A",
            color: userLat ? "#304C3A" : "#ffffff",
            border: userLat ? "1.5px solid #BDD2B7" : "none",
          }}
        >
          {locLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LocateFixed size={14} />
          )}
          {userLat
            ? "Locatie actief"
            : locLoading
            ? "Locatie zoeken…"
            : "Gebruik mijn locatie"}
        </button>

        {locError && (
          <div className="mt-2 flex items-center gap-2">
            <X size={12} color="#dc2626" />
            <p className="text-xs" style={{ color: "#dc2626" }}>
              {locError}
            </p>
          </div>
        )}
      </div>

      {/* ── Winkellijst ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24">
        {userLat && (
          <p className="text-xs mb-3" style={{ color: "#9aada2" }}>
            Gesorteerd op afstand van uw locatie
          </p>
        )}

        <div className="flex flex-col gap-3">
          {winkels.map((w) => {
            const Icon = TYPE_ICON[w.type];
            const open = isNuOpen(w.openingHours);
            const isOpen = geselecteerd === w.id;
            const vandaag = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"][new Date().getDay()];

            return (
              <div
                key={w.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "#ffffff", border: "1px solid #e8ede9" }}
              >
                {/* Kaart header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  onClick={() => setGeselecteerd(isOpen ? null : w.id)}
                  aria-expanded={isOpen}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF5EE" }}
                  >
                    <Icon size={20} color="#304C3A" strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>
                        {w.name}
                      </span>
                      {open === true && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(5,150,105,0.1)",
                            color: "#059669",
                            border: "1px solid rgba(5,150,105,0.2)",
                          }}
                        >
                          Nu open
                        </span>
                      )}
                      {open === false && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(180,83,9,0.08)",
                            color: "#b45309",
                            border: "1px solid rgba(180,83,9,0.2)",
                          }}
                        >
                          Gesloten
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7F73" }}>
                      {w.address}, {w.city}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "#9aada2" }}>
                        {TYPE_LABEL[w.type]}
                      </span>
                      {w.distance !== undefined && (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#304C3A" }}>
                          <Navigation size={10} />
                          {formatAfstand(w.distance)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    color="#9aada2"
                    strokeWidth={1.5}
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  />
                </button>

                {/* Uitklap detail */}
                {isOpen && (
                  <div
                    className="px-4 pb-4"
                    style={{ borderTop: "1px solid #e8ede9" }}
                  >
                    <div className="grid grid-cols-1 gap-5 pt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {/* Openingstijden */}
                      <div>
                        <p
                          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3"
                          style={{ color: "#6B7F73" }}
                        >
                          <Clock size={12} /> Openingstijden
                        </p>
                        <div className="flex flex-col gap-1">
                          {Object.entries(w.openingHours).map(([dag, tijd]) => (
                            <div
                              key={dag}
                              className="flex justify-between text-xs py-1"
                              style={{
                                borderBottom: "1px solid #f0f4f1",
                                color: dag === vandaag ? "#122A1A" : "#6B7F73",
                                fontWeight: dag === vandaag ? 600 : 400,
                              }}
                            >
                              <span>
                                {dag === vandaag && (
                                  <span style={{ color: "#51C675" }}>▸ </span>
                                )}
                                {dag}
                              </span>
                              <span>{tijd}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact & route */}
                      <div>
                        <p
                          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3"
                          style={{ color: "#6B7F73" }}
                        >
                          <Phone size={12} /> Contact
                        </p>
                        <a
                          href={`tel:${w.phone}`}
                          className="block text-sm font-medium mb-4"
                          style={{ color: "#304C3A" }}
                        >
                          {w.phone}
                        </a>

                        <a
                          href={getMapsUrl(w)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white"
                          style={{ background: "#304C3A" }}
                        >
                          <Navigation size={14} />
                          Route plannen
                        </a>

                        {w.distance !== undefined && (
                          <p
                            className="text-xs text-center mt-2 font-medium"
                            style={{ color: "#51C675" }}
                          >
                            {formatAfstand(w.distance)} van uw locatie
                          </p>
                        )}

                        {/* Coördinaten */}
                        <div
                          className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-xl"
                          style={{ background: "#EFF5EE" }}
                        >
                          <MapPin size={14} color="#304C3A" strokeWidth={1.5} />
                          <span className="text-xs font-mono" style={{ color: "#6B7F73" }}>
                            {w.latitude.toFixed(4)}°, {w.longitude.toFixed(4)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}