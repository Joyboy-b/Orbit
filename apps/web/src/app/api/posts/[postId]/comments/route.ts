import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createComment } from "@/lib/feed-store";

type RouteContext = { params: Promise<{ postId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to comment." }, { status: 401 });
  const payload: unknown = await request.json().catch(() => null);
  const body = payload && typeof payload === "object" && "body" in payload ? (payload as { body?: unknown }).body : null;
  const normalizedBody = typeof body === "string" ? body.trim() : "";
  if (!normalizedBody || normalizedBody.length > 280) return NextResponse.json({ error: "Comments must be between 1 and 280 characters." }, { status: 400 });
  const { postId } = await params;
  const comment = createComment(postId, user.id, normalizedBody);
  if (!comment) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ comment }, { status: 201 });
}
