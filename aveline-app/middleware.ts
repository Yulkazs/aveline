import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

const PROTECTED    = ["/dashboard"];
const AUTH_ONLY    = ["/login", "/register", "/welcome"];
const GUEST_ROUTES = ["/scan", "/recepten", "/winkels"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Redirect /home → /dashboard ────────────────────────────────────────────
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/home/, "/dashboard");
    return NextResponse.redirect(url);
  }

  // ── Gast-routes: altijd toegankelijk ───────────────────────────────────────
  if (GUEST_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── Presentatie join + wachtkamer: publiek ──────────────────────────────────
  if (
    pathname.startsWith("/presentatie/") &&
    !pathname.startsWith("/presentatie/dashboard")
  ) {
    return NextResponse.next();
  }

  // ── Presentatie dashboard: vereist aveline_presentation_token ──────────────
  if (pathname.startsWith("/presentatie/dashboard")) {
    const presentationToken = req.cookies.get("aveline_presentation_token")?.value;

    if (!presentationToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      const { payload } = await jwtVerify(presentationToken, JWT_SECRET);
      if (payload.role !== "PRESENTATION") throw new Error("Verkeerde rol");
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/", req.url));
      res.cookies.set("aveline_presentation_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return res;
    }
  }

  // ── Normale aveline_token verificatie ───────────────────────────────────────
  const token = req.cookies.get("aveline_token")?.value;
  let isValid = false;
  let userId: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isValid = true;
      userId = payload.sub as string;
    } catch {
      isValid = false;
    }
  }

  // ── Presentatie-deelnemers mogen ook /dashboard/* bezoeken ─────────────────
  // Ze hebben geen aveline_token maar wel aveline_presentation_token.
  // Daarmee mogen ze alle dashboard sub-routes bezoeken.
  if (!isValid && pathname.startsWith("/dashboard")) {
    const presentationToken = req.cookies.get("aveline_presentation_token")?.value;

    if (presentationToken) {
      try {
        const { payload } = await jwtVerify(presentationToken, JWT_SECRET);
        if (payload.role === "PRESENTATION") {
          return NextResponse.next();
        }
      } catch {
        // Ongeldig — val door naar normale redirect
      }
    }
  }

  // ── Verifieer of gebruiker nog bestaat in DB (alleen voor /dashboard) ───────
  if (isValid && userId && pathname.startsWith("/dashboard")) {
    try {
      const apiUrl = new URL("/api/auth/check-user", req.url);
      apiUrl.searchParams.set("userId", userId);

      const check = await fetch(apiUrl.toString(), {
        headers: { "x-internal-check": "1" },
      });

      if (!check.ok) {
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.set("aveline_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
        });
        return res;
      }
    } catch {
      // DB down — laat door
    }
  }

  // ── Beveilig /dashboard ─────────────────────────────────────────────────────
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Al ingelogd — stuur weg van auth-pagina's ───────────────────────────────
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/welcome",
    "/scan/:path*",
    "/recepten/:path*",
    "/winkels/:path*",
    "/presentatie/:path*",
  ],
};