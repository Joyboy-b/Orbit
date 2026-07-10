import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/feed-store";
import type { FeedMode } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const requestedMode = request.nextUrl.searchParams.get("mode");
  const mode: FeedMode = requestedMode === "latest" ? "latest" : "ranked";

  return NextResponse.json({ mode, posts: getFeed(mode) });
}
