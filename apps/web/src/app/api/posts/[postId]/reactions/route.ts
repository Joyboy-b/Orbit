import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleReaction } from "@/lib/feed-store";

type RouteContext = { params: Promise<{ postId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to react to posts." }, { status: 401 });
  const { postId } = await params;
  const reaction = toggleReaction(postId, user.id);
  if (!reaction) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json(reaction);
}
