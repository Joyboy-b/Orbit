import { posts as seedPosts, viewer } from "./seed";
import { chronologicalPosts, rankPosts } from "./ranking";
import type { FeedMode, FeedPost, Post } from "./types";

// A deliberate demo repository: replace this with PostgreSQL in the production adapter.
const posts: Post[] = seedPosts.map((post) => ({ ...post, media: post.media ? { ...post.media } : undefined }));
const reactions = new Set<string>();

function reactionKey(postId: string) {
  return `${viewer.id}:${postId}`;
}

export function getFeed(mode: FeedMode): FeedPost[] {
  const ordered = mode === "latest" ? chronologicalPosts(posts) : rankPosts(posts);

  return ordered.map((post) => ({
    ...post,
    reacted: reactions.has(reactionKey(post.id))
  }));
}

export function createPost(body: string): FeedPost {
  const post: Post = {
    id: `p-${crypto.randomUUID()}`,
    authorId: viewer.id,
    communityId: "c-systems",
    body,
    createdAt: new Date().toISOString(),
    visibility: "public",
    reactions: 0,
    comments: 0,
    reposts: 0,
    saves: 0
  };

  posts.unshift(post);
  return getFeed("ranked").find((candidate) => candidate.id === post.id)!;
}

export function toggleReaction(postId: string) {
  const post = posts.find((candidate) => candidate.id === postId);
  if (!post) return null;

  const key = reactionKey(postId);
  const reacted = reactions.has(key);

  if (reacted) {
    reactions.delete(key);
    post.reactions = Math.max(0, post.reactions - 1);
  } else {
    reactions.add(key);
    post.reactions += 1;
  }

  return {
    postId,
    reacted: !reacted,
    reactions: post.reactions
  };
}
