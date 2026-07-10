import { NextResponse } from "next/server";
import { toggleReaction } from "@/lib/feed-store";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { postId } = await params;
  const reaction = toggleReaction(postId);

  if (!reaction) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(reaction);
}
