import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPost } from "@/lib/feed-store";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to publish a post." }, { status: 401 });
  const payload: unknown = await request.json().catch(() => null);
  const body = payload && typeof payload === "object" && "body" in payload ? (payload as { body?: unknown }).body : null;
  if (typeof body !== "string") return NextResponse.json({ error: "Post body is required." }, { status: 400 });
  const normalizedBody = body.trim();
  if (!normalizedBody || normalizedBody.length > 500) return NextResponse.json({ error: "Posts must be between 1 and 500 characters." }, { status: 400 });
  return NextResponse.json({ post: createPost(user.id, normalizedBody) }, { status: 201 });
}
