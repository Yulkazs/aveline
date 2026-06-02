import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

export type PresentationPayload = {
  sessionId: string;
  sessionCode: string;
  username: string;
  participantId: string;
  role: "PRESENTATION";
};

/**
 * Issue a short-lived JWT for a presentation participant.
 * Stored in aveline_presentation_token (separate from aveline_token).
 */
export async function signPresentationToken(
  payload: Omit<PresentationPayload, "role">
): Promise<string> {
  return new SignJWT({ ...payload, role: "PRESENTATION" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

/**
 * Read + verify the presentation cookie.
 * Returns null if missing or invalid.
 */
export async function getPresentationAuth(): Promise<PresentationPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("aveline_presentation_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "PRESENTATION") return null;

    return {
      sessionId:     payload.sessionId     as string,
      sessionCode:   payload.sessionCode   as string,
      username:      payload.username      as string,
      participantId: payload.participantId as string,
      role:          "PRESENTATION",
    };
  } catch {
    return null;
  }
}