import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPost } from "@/lib/feed-store";
import { saveMediaUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to publish a post." }, { status: 401 });

  let body: unknown;
  let communityId: unknown = "c-systems";
  let mediaFile: File | null = null;
  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const formData = await request.formData();
    body = formData.get("body");
    communityId = formData.get("communityId");
    const file = formData.get("media");
    if (file instanceof File && file.size > 0) mediaFile = file;
  } else {
    const payload: unknown = await request.json().catch(() => null);
    body = payload && typeof payload === "object" && "body" in payload ? (payload as { body?: unknown }).body : null;
    communityId = payload && typeof payload === "object" && "communityId" in payload ? (payload as { communityId?: unknown }).communityId : "c-systems";
  }

  if (typeof body !== "string") return NextResponse.json({ error: "Post body is required." }, { status: 400 });
  const normalizedBody = body.trim();
  if ((!normalizedBody && !mediaFile) || normalizedBody.length > 500) return NextResponse.json({ error: "Posts need text up to 500 characters or an upload." }, { status: 400 });
  const selectedCommunityId = typeof communityId === "string" && communityId ? communityId : "c-systems";

  try {
    const media = mediaFile ? await saveMediaUpload(mediaFile) : undefined;
    return NextResponse.json({ post: createPost(user.id, normalizedBody, media, selectedCommunityId) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save that upload." }, { status: 400 });
  }
}
