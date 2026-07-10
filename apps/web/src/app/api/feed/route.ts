import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFeed } from "@/lib/feed-store";
import type { FeedMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode: FeedMode = requestedMode === "latest" ? "latest" : "ranked";
  const user = await getCurrentUser();
  return NextResponse.json({ mode, posts: getFeed(mode, user?.id) });
}
