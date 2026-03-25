import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";

type SessionData = {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number | null;
};

// Demo-only in-memory session store.
// In production, this should be replaced with a shared durable store
// such as Redis or a database because sessions are lost on restart
// and are not shared across multiple instances.
const sessionStore = new Map<string, SessionData>();

const SESSION_COOKIE_NAME = "session_id";

// Sign session IDs before storing them in cookies so the server can
// detect tampering without exposing raw session identifiers as trusted input.
function signSessionId(sessionId: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(sessionId).digest("hex");
}

export function createSession(data: SessionData) {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, data);

  const signature = signSessionId(sessionId);
  return `${sessionId}.${signature}`;
}

export function readSession(signedValue?: string) {
  if (!signedValue) {
    return null;
  }

  const [sessionId, signature] = signedValue.split(".");

  if (!sessionId || !signature) {
    return null;
  }

  const expected = signSessionId(sessionId);

  const isValid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );

  if (!isValid) {
    return null;
  }

  const session = sessionStore.get(sessionId);
  return session ?? null;
}

// Expire server-side sessions even if the browser still sends the cookie.
export function clearSession(signedValue?: string) {
  if (!signedValue) {
    return;
  }

  const [sessionId] = signedValue.split(".");
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
};