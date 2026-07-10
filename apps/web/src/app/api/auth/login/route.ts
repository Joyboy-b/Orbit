import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { database } from "@/lib/database";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  const user = database.prepare("SELECT id, name, handle, password_hash FROM users WHERE email = ?").get(email) as { id: string; name: string; handle: string; password_hash: string } | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);
  return NextResponse.json({ user: { id: user.id, name: user.name, handle: user.handle } });
}
