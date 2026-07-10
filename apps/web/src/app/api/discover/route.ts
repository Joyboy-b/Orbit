import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDiscoverUsers } from "@/lib/feed-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const users = getDiscoverUsers(user?.id).map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    handle: candidate.handle,
    role: "Orbit builder",
    followers: Number(candidate.follower_count),
    following: 0,
    affinity: candidate.affinity,
    followerCount: Number(candidate.follower_count),
    isFollowing: Boolean(candidate.is_following)
  }));
  return NextResponse.json({ users });
}
