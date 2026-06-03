"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Users } from "lucide-react";

type SessionStatus = "WAITING" | "ACTIVE" | "ENDED";

export default function PresentatieJoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [username, setUsername]           = useState("");
  const [error, setError]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [checking, setChecking]           = useState(true);
  const [sessionValid, setSessionValid]   = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch(`/api/presentation/sessions/${code}`).catch(() => null);
      if (!res?.ok) {
        setSessionValid(false);
        setChecking(false);
        return;
      }
      const data = await res.json();
      setSessionStatus(data.status);
      setSessionValid(data.status !== "ENDED");
      setChecking(false);
    }
    checkSession();
  }, [code]);

  async function handleJoin() {
    if (!username.trim()) {
      setError("Vul een gebruikersnaam in.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/presentation/sessions/${code}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() }),
    }).catch(() => null);

    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}));
      setError(data?.message ?? "Er ging iets mis. Probeer opnieuw.");
      setLoading(false);
      return;
    }

    const data = await res.json();

    if (data.sessionStatus === "ACTIVE") {
      router.push("/presentatie/dashboard");
    } else {
      router.push(`/presentatie/${code}/wachtkamer`);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="mobile-shell flex items-center justify-center">
        <Loader2 size={24} color="#BDD2B7" className="animate-spin" />
      </div>
    );
  }

  // ── Ongeldige of afgelopen sessie ─────────────────────────────────────────
  if (!sessionValid) {
    return (
      <div className="mobile-shell">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#FEF2F2" }}
          >
            <span className="text-3xl">🍫</span>
          </div>
          <div>
            <h1
              className="font-display text-2xl font-semibold mb-2"
              style={{ color: "#122A1A" }}
            >
              Sessie niet gevonden
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#7a8f82" }}>
              {sessionStatus === "ENDED"
                ? "Deze presentatie is al afgelopen."
                : "De sessie-code is ongeldig of verlopen. Vraag de presentator om de juiste link."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Join form ─────────────────────────────────────────────────────────────
  return (
    <div className="mobile-shell">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "#EFF5EE" }}
        >
          <span className="text-4xl">🍫</span>
        </div>

        <h1
          className="font-display text-3xl font-semibold text-center mb-2"
          style={{ color: "#122A1A" }}
        >
          Avéline Demo
        </h1>
        <p className="text-sm text-center mb-10" style={{ color: "#7a8f82" }}>
          Sessie{" "}
          <span className="font-mono font-semibold" style={{ color: "#304C3A" }}>
            {code}
          </span>
        </p>

        <div className="w-full flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold"
            style={{ color: "#122A1A" }}
          >
            Kies een gebruikersnaam
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="bijv. Sophie, TeamA…"
            maxLength={20}
            autoFocus
            autoComplete="off"
            className="input-field text-base"
            style={error ? { borderColor: "#DC2626" } : {}}
          />
          {error && (
            <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>
          )}
          <p className="text-xs" style={{ color: "#BDD2B7" }}>
            {username.length}/20 · Zichtbaar voor de presentator
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-10 pt-4">
        <button
          onClick={handleJoin}
          disabled={loading || !username.trim()}
          className="btn-primary flex items-center justify-center gap-2"
          style={{ opacity: loading || !username.trim() ? 0.55 : 1 }}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Users size={18} />
              Deelnemen
            </>
          )}
        </button>
      </div>
    </div>
  );
}