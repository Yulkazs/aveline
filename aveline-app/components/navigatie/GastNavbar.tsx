"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanLine, BookOpen, MapPin } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/scan",
    label: "Scannen",
    icon: ScanLine,
  },
  {
    href: "/recepten",
    label: "Recepten",
    icon: BookOpen,
  },
  {
    href: "/winkels",
    label: "Winkels",
    icon: MapPin,
  },
];

export default function GastNavbar() {
  const pathname = usePathname();

  return (
    // FIX: geen fragment (<>) maar één enkele wrapper-div.
    // De spacer zit erin als eerste kind zodat de nav de content niet overlapt.
    <div className="gast-nav-root">
      {/* Spacer zodat pagina-content niet achter de navbar verdwijnt */}
      <div className="nav-spacer" aria-hidden="true" />

      <nav className="gast-nav" role="navigation" aria-label="Hoofdnavigatie">
        <div className="nav-inner">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon-wrap">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2 : 1.5}
                    className="nav-icon"
                  />
                  {active && <span className="nav-dot" aria-hidden="true" />}
                </span>
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        /* ── Root wrapper ── */
        /* De wrapper zelf is onzichtbaar en mag geen layout breken */
        .gast-nav-root {
          display: contents; /* gedraagt zich niet als block-element */
        }

        /* ── Spacer ── */
        /* Alleen zichtbaar op mobiel; duwt content boven de vaste navbar */
        .nav-spacer {
          display: block;
          height: 64px;
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .nav-spacer { display: none; }
        }

        /* ── Navbar ── */
        .gast-nav {
          --forest:     #1c3a2a;
          --gold:       #c9a84c;
          --gold-light: #e8d49a;
          --cream:      #f8f4ed;
          --sans: "Gill Sans", "Gill Sans MT", Calibri, sans-serif;

          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;

          background: var(--forest);
          border-top: 1px solid rgba(201, 168, 76, 0.25);

          /* Safe area voor iPhones met home-indicator */
          padding-bottom: env(safe-area-inset-bottom, 0px);

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Op desktop verbergen */
        @media (min-width: 768px) {
          .gast-nav { display: none; }
        }

        .nav-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 64px;
          max-width: 480px;
          margin: 0 auto;
          padding: 0 8px;
        }

        /* ── Nav item ── */
        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-decoration: none;
          padding: 8px 4px;
          border-radius: 8px;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }
        .nav-item:active {
          background: rgba(201, 168, 76, 0.08);
        }

        /* ── Icon wrapper ── */
        .nav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .nav-icon {
          color: rgba(248, 244, 237, 0.45);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .nav-item.active .nav-icon {
          color: var(--gold);
          transform: translateY(-1px);
        }

        /* Actieve stip */
        .nav-dot {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--gold);
          animation: dotPop 0.25s ease both;
        }
        @keyframes dotPop {
          from { transform: translateX(-50%) scale(0); opacity: 0; }
          to   { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* ── Label ── */
        .nav-label {
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(248, 244, 237, 0.4);
          transition: color 0.2s ease;
          line-height: 1;
        }
        .nav-item.active .nav-label {
          color: var(--gold-light);
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}