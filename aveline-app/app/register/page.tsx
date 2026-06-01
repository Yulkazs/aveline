"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  password: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

/* ─── Google icon ────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Validation ─────────────────────────────────────────────────────────── */
function validate(form: FormState): Errors {
  const errs: Errors = {};
  if (!form.name.trim())                          errs.name     = "Naam is verplicht";
  if (!form.email.trim())                         errs.email    = "E-mailadres is verplicht";
  else if (!/\S+@\S+\.\S+/.test(form.email))     errs.email    = "Ongeldig e-mailadres";
  if (!form.password)                             errs.password = "Wachtwoord is verplicht";
  else if (form.password.length < 8)              errs.password = "Minimaal 8 tekens";
  return errs;
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const [form, setForm]       = useState<FormState>({ name: "", email: "", password: "" });
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ email: data.message ?? "Registratie mislukt. Probeer opnieuw." });
      } else {
        window.location.href = "/login";
      }
    } catch {
      setErrors({ email: "Er ging iets mis. Controleer je verbinding." });
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
          Account aanmaken
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#7a8f82" }}>
          Vul je gegevens in om te beginnen
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col flex-1 px-6 animate-fade-slide-up delay-100"
      >
        <div className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium" style={{ color: "#122A1A" }}>
              Naam
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Je volledige naam"
              value={form.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? "error" : ""}`}
            />
            {errors.name && (
              <span className="text-xs text-red-600">{errors.name}</span>
            )}
          </div>

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
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "#122A1A" }}>
              Wachtwoord
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimaal 8 tekens"
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
            {loading ? "Even geduld…" : "Account aanmaken"}
          </button>

          <div className="divider">Of</div>

          <button
            type="button"
            className="btn-secondary flex items-center gap-2"
            onClick={() => { window.location.href = "/api/auth/google"; }}
          >
            <GoogleIcon />
            Inloggen met Google
          </button>
        </div>
      </form>
    </div>
  );
}