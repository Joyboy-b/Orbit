import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleFollow } from "@/lib/feed-store";

type RouteContext = { params: Promise<{ userId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to follow people." }, { status: 401 });
  const { userId } = await params;
  const result = toggleFollow(user.id, userId);
  if (!result) return NextResponse.json({ error: "That profile is not available." }, { status: 404 });
  return NextResponse.json(result);
}
