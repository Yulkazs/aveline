"use client";

import { useEffect, useState } from "react";
import BottomNav, { type UserRole } from "./BottomNav";

type Props = { initialRole: string };

/**
 * Hydrates the BottomNav with the server-provided role immediately,
 * then re-fetches the current role from the DB on mount.
 * This guarantees the nav is always correct even when:
 *   - the role changed in the DB after the JWT was issued
 *   - the Next.js layout was cached from a previous session
 */
export default function BottomNavWrapper({ initialRole }: Props) {
  const [role, setRole] = useState<UserRole>(initialRole as UserRole);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.role && data.role !== role) {
          setRole(data.role as UserRole);
        }
      })
      .catch(() => {
        // Keep initialRole on network error — silent fallback
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <BottomNav role={role} />;
}