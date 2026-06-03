"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  QrCode,
  ShoppingCart,
  User,
  MessageCircle,
  Users,
  MapPin,
  BarChart2,
  BookOpen,
  Megaphone,
  AlertCircle,
  Package,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type UserRole =
  | "GUEST"
  | "B2C_CLIENT"
  | "B2B_CLIENT"
  | "CUSTOMER_SERVICE"
  | "MARKETING"
  | "ADMIN";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* ─── Nav definitions per role ───────────────────────────────────────────── */
const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  GUEST: [
    { label: "Scan",      href: "/scan",      icon: QrCode    },
    { label: "Recepten",  href: "/recepten",  icon: BookOpen  },
    { label: "Winkels",   href: "/winkels",   icon: MapPin    },
    { label: "Inloggen",  href: "/login",     icon: User      },
  ],

  B2C_CLIENT: [
    { label: "Home",      href: "/dashboard",              icon: Home          },
    { label: "Scan",      href: "/dashboard/scan",         icon: QrCode        },
    { label: "Producten", href: "/dashboard/producten",    icon: Package       },
    { label: "Chat",      href: "/dashboard/chat",         icon: MessageCircle },
    { label: "Community", href: "/dashboard/community",    icon: Users         },
    { label: "Profiel",   href: "/dashboard/profiel",      icon: User          },
  ],

  B2B_CLIENT: [
    { label: "Home",      href: "/dashboard",              icon: Home       },
    { label: "Catalogus", href: "/dashboard/catalogus",    icon: BookOpen   },
    { label: "Orders",    href: "/dashboard/orders",       icon: ShoppingCart },
    { label: "Analytics", href: "/dashboard/analytics",    icon: BarChart2  },
    { label: "Profiel",   href: "/dashboard/profiel",      icon: User       },
  ],

  CUSTOMER_SERVICE: [
    { label: "Klachten",  href: "/dashboard/klachten",  icon: AlertCircle   },
    { label: "Chat",      href: "/dashboard/chat",      icon: MessageCircle },
    { label: "Community", href: "/dashboard/community", icon: Users         },
    { label: "Profiel",   href: "/dashboard/profiel",   icon: User          },
  ],

  MARKETING: [
    { label: "Home",      href: "/dashboard",              icon: Home       },
    { label: "Promoties", href: "/dashboard/promoties",    icon: Megaphone  },
    { label: "Community", href: "/dashboard/community",    icon: Users      },
    { label: "Profiel",   href: "/dashboard/profiel",      icon: User       },
  ],

  ADMIN: [
    { label: "Home",      href: "/dashboard",           icon: Home          },
    { label: "Community", href: "/dashboard/community", icon: Users         },
    { label: "Profiel",   href: "/dashboard/profiel",   icon: User          },
  ],
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_CONFIG[role] ?? NAV_CONFIG.GUEST;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Navigatie"
      className="flex-shrink-0 border-t"
      style={{
        background:   "#ffffff",
        borderColor:  "#e8ede9",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="flex items-stretch" role="list">
        {items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center justify-center gap-1 py-3 w-full transition-opacity active:opacity-60"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                  color={active ? "#304C3A" : "#9aada2"}
                />
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: active ? "#304C3A" : "#9aada2" }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "#51C675" }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}