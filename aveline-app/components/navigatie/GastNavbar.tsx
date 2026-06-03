"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, BookOpen, MapPin, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Scan",     href: "/scan",     icon: QrCode   },
  { label: "Recepten", href: "/recepten", icon: BookOpen },
  { label: "Winkels",  href: "/winkels",  icon: MapPin   },
  { label: "Inloggen", href: "/login",    icon: User     },
];

export default function GastNavbar() {
  const pathname = usePathname();

  if (pathname === "/welcome") return null;
  if (pathname === "/login") return null;
  if (pathname === "/register") return null;
  if (pathname === "/page.tsx") return null;

  function isActive(href: string) {
    if (href === "/scan") return pathname === "/scan";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    // Één <div> wrapper — geen fragment (<>), voorkomt hydration error
    // als de component direct in <body> geplaatst wordt.
    <div>
      {/* Duwt de pagina-inhoud omhoog zodat de fixed navbar niets bedekt */}
      <div style={{ height: 64 }} aria-hidden="true" />

      {/* Identieke styling als BottomNav voor andere rollen */}
      <nav
        aria-label="Navigatie"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#ffffff",
          borderTop: "1px solid #e8ede9",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <ul
          style={{
            display: "flex",
            alignItems: "stretch",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
          role="list"
        >
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href} style={{ flex: 1 }}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    padding: "12px 4px",
                    width: "100%",
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2 : 1.5}
                    color={active ? "#304C3A" : "#9aada2"}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      lineHeight: 1,
                      color: active ? "#304C3A" : "#9aada2",
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#51C675",
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}