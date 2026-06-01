"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

type FormState = { email: string; password: string };
type Errors    = Partial<Record<keyof FormState, string>>;

/* ─── Validation ─────────────────────────────────────────────────────────── */
function validate(form: FormState): Errors {
  const errs: Errors = {};
  if (!form.email.trim())                       errs.email    = "E-mailadres is verplicht";
  else if (!/\S+@\S+\.\S+/.test(form.email))   errs.email    = "Ongeldig e-mailadres";
  if (!form.password)                           errs.password = "Wachtwoord is verplicht";
  return errs;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [form, setForm]       = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors]   = useState<Errors>({});
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((err) => ({ ...err, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ password: data.message ?? "Inloggen mislukt. Controleer je gegevens." });
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setErrors({ password: "Er ging iets mis. Controleer je verbinding." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mobile-shell">
      {/* Back */}
      <div className="px-5 pt-14">
        <Link href="/welcome" className="btn-ghost w-fit" aria-label="Terug">
          <ChevronLeft size={20} strokeWidth={2} />
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 pt-4 pb-6 animate-fade-slide-up">
        <h1 className="font-display text-[2.2rem] font-semibold leading-tight" style={{ color: "#122A1A" }}>
          Welkom terug
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#7a8f82" }}>
          Log in om verder te gaan
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col flex-1 px-6 animate-fade-slide-up delay-100"
      >
        <div className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "#122A1A" }}>
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voorbeeld@email.com"
              value={form.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? "error" : ""}`}
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium" style={{ color: "#122A1A" }}>
                Wachtwoord
              </label>
              <Link
                href="/forgot-password"
                className="text-sm underline underline-offset-2"
                style={{ color: "#304C3A" }}
              >
                Wachtwoord vergeten?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={`input-field pr-12 ${errors.password ? "error" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-600">{errors.password}</span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="flex flex-col gap-3 py-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Even geduld…" : "Inloggen"}
          </button>

          <p className="text-center text-sm" style={{ color: "#7a8f82" }}>
            Nog geen account?{" "}
            <Link
              href="/register"
              className="font-medium underline underline-offset-2"
              style={{ color: "#304C3A" }}
            >
              Registreer hier
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}