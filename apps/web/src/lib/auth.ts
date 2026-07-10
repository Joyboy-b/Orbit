import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { database } from "./database";

const SESSION_COOKIE = "orbit_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;
const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

type SessionUser = { id: string; name: string; email: string; handle: string; affinity: number };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  database.prepare("INSERT INTO sessions (id, token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomBytes(16).toString("hex"), hashToken(token), userId, expiresAt.toISOString(), new Date().toISOString());
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt, maxAge: SESSION_MAX_AGE_SECONDS, path: "/" });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = database.prepare(`SELECT users.id, users.name, users.email, users.handle, users.affinity, sessions.expires_at
    FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ?`).get(hashToken(token)) as (SessionUser & { expires_at: string }) | undefined;
  if (!session) return null;
  if (new Date(session.expires_at) <= new Date()) {
    database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    (await cookies()).delete(SESSION_COOKIE);
    return null;
  }
  return { id: session.id, name: session.name, email: session.email, handle: session.handle, affinity: session.affinity };
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  cookieStore.delete(SESSION_COOKIE);
}
