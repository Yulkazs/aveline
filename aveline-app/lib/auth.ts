import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

export type AuthPayload = {
  sub: string;
  email: string;
  role: string;
};

/**
 * Returns the verified JWT payload with the role refreshed from the DB.
 * 
 * The JWT is valid for 7 days, so the role claim inside it can be stale
 * (e.g. a user promoted to CUSTOMER_SERVICE after logging in).
 * We always fetch the live role from the DB so that page-level role
 * guards are never fooled by an outdated token.
 *
 * Use in Server Components and Server Actions.
 */
export async function getAuth(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aveline_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sub = payload.sub as string;
    if (!sub) return null;

    // Refresh the role from the DB so stale JWTs never cause wrong redirects.
    const dbUser = await prisma.user.findUnique({
      where: { id: sub },
      select: { role: true, email: true },
    });

    if (!dbUser) return null;

    return {
      sub,
      email: dbUser.email,
      role:  dbUser.role,
    };
  } catch {
    return null;
  }
}