import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/feed-store";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to update notifications." }, { status: 401 });
  markNotificationsRead(user.id);
  return NextResponse.json({ ok: true });
}
