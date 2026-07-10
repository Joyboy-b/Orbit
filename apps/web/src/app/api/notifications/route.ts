import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to view notifications." }, { status: 401 });
  const notifications = getNotifications(user.id).map((item) => ({
    id: item.id,
    kind: item.kind,
    actorName: item.actor_name,
    actorHandle: item.actor_handle,
    createdAt: item.created_at,
    readAt: item.read_at
  }));
  return NextResponse.json({ notifications });
}
