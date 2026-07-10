import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toggleRepost } from "@/lib/feed-store";

type RouteContext = { params: Promise<{ postId: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to use this action." }, { status: 401 });
  const { postId } = await params;
  const result = toggleRepost(postId, user.id);
  if (!result) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json(result);
}
