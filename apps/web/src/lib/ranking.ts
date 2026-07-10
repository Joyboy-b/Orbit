import { communities, users } from "./seed";
import type { Post, RankedPost } from "./types";

export function rankPosts(posts: Post[]): RankedPost[] {
  const now = Date.now();

  return posts
    .map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      const community = communities.find((item) => item.id === post.communityId);
      const ageHours = Math.max(
        1,
        (now - new Date(post.createdAt).getTime()) / 1000 / 60 / 60
      );
      const recency = 45 / Math.sqrt(ageHours);
      const affinity = (author?.affinity ?? 0.3) * 38;
      const engagement =
        Math.log10(post.reactions + 1) * 12 +
        Math.log10(post.comments + 1) * 9 +
        Math.log10(post.reposts + 1) * 8 +
        Math.log10(post.saves + 1) * 7;
      const mediaBoost = post.media ? 8 : 0;
      const communityBoost = community ? 6 : 0;
      const score = recency + affinity + engagement + mediaBoost + communityBoost;

      return {
        ...post,
        score,
        explanation: [
          `recency ${recency.toFixed(1)}`,
          `affinity ${affinity.toFixed(1)}`,
          `engagement ${engagement.toFixed(1)}`,
          post.media ? "media boost 8.0" : "text only",
          community ? `community ${community.name}` : "profile post"
        ]
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function chronologicalPosts(posts: Post[]): RankedPost[] {
  return rankPosts(posts).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
