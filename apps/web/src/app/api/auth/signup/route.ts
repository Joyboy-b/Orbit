import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { database } from "@/lib/database";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { name?: unknown; handle?: unknown; email?: unknown; password?: unknown } | null;
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const handle = typeof payload?.handle === "string" ? payload.handle.trim().toLowerCase().replace(/^@/, "") : "";
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  if (!name || name.length > 60 || !/^[a-z0-9_]{3,20}$/.test(handle) || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return NextResponse.json({ error: "Use a name, a 3-20 character handle, a valid email, and an 8+ character password." }, { status: 400 });
  const existing = database.prepare("SELECT id FROM users WHERE email = ? OR handle = ?").get(email, handle);
  if (existing) return NextResponse.json({ error: "That email or handle is already in use." }, { status: 409 });
  const id = randomUUID();
  database.prepare("INSERT INTO users (id, name, email, handle, password_hash, affinity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, name, email, handle, await bcrypt.hash(password, 12), 0.5, new Date().toISOString());
  const session = await createSession(id);
  await setSessionCookie(session.token, session.expiresAt);
  return NextResponse.json({ user: { id, name, handle } }, { status: 201 });
}
