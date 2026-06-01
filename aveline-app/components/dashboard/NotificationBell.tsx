"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data)) {
          setHasUnread(data.some((n: { isRead: boolean }) => !n.isRead));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <button
      onClick={() => router.push("/dashboard/notificaties")}
      className="relative p-2 rounded-full"
      style={{ background: "#f5f8f5" }}
      aria-label="Notificaties"
    >
      <Bell size={20} color="#304C3A" />
      {hasUnread && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
          style={{ background: "#51C675" }}
        />
      )}
    </button>
  );
}