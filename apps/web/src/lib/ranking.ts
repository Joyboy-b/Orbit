import type { Post, RankedPost } from "./types";

type RankablePost = Post & { authorAffinity: number; communityName?: string };

export function rankPosts(posts: RankablePost[]): RankedPost[] {
  const now = Date.now();
  return posts.map((post) => {
    const ageHours = Math.max(1, (now - new Date(post.createdAt).getTime()) / 3_600_000);
    const recency = 45 / Math.sqrt(ageHours);
    const affinity = post.authorAffinity * 38;
    const engagement = Math.log10(post.reactions + 1) * 12 + Math.log10(post.comments + 1) * 9 + Math.log10(post.reposts + 1) * 8 + Math.log10(post.saves + 1) * 7;
    const mediaBoost = post.media ? 8 : 0;
    const communityBoost = post.communityName ? 6 : 0;
    return {
      ...post,
      score: recency + affinity + engagement + mediaBoost + communityBoost,
      explanation: [
        `recency ${recency.toFixed(1)}`,
        `affinity ${affinity.toFixed(1)}`,
        `engagement ${engagement.toFixed(1)}`,
        post.media ? "media boost 8.0" : "text only",
        post.communityName ? `community ${post.communityName}` : "profile post"
      ]
    };
  }).sort((left, right) => right.score - left.score);
}

export function chronologicalPosts(posts: RankablePost[]): RankedPost[] {
  return rankPosts(posts).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}
