import { randomUUID } from "crypto";
import { database } from "./database";
import { chronologicalPosts, rankPosts } from "./ranking";
import type { FeedMode, FeedPost, Post } from "./types";

type FeedRow = {
  id: string; body: string; visibility: Post["visibility"]; media_type: "image" | "link" | "video" | null; media_title: string | null;
  created_at: string; author_id: string; community_id: string | null; author_name: string; author_handle: string; author_affinity: number;
  community_name: string | null; reaction_count: number; comment_count: number; repost_count: number; save_count: number;
  reacted: number; reposted: number; saved: number;
};

function rowsFor(viewerId?: string) {
  return database.prepare(`SELECT posts.id, posts.body, posts.visibility, posts.media_type, posts.media_title, posts.created_at,
    posts.author_id, posts.community_id, users.name AS author_name, users.handle AS author_handle, users.affinity AS author_affinity,
    communities.name AS community_name,
    (SELECT COUNT(*) FROM reactions WHERE reactions.post_id = posts.id) AS reaction_count,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comment_count,
    (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = posts.id) AS repost_count,
    (SELECT COUNT(*) FROM bookmarks WHERE bookmarks.post_id = posts.id) AS save_count,
    CASE WHEN EXISTS (SELECT 1 FROM reactions WHERE post_id = posts.id AND user_id = ?) THEN 1 ELSE 0 END AS reacted,
    CASE WHEN EXISTS (SELECT 1 FROM reposts WHERE post_id = posts.id AND user_id = ?) THEN 1 ELSE 0 END AS reposted,
    CASE WHEN EXISTS (SELECT 1 FROM bookmarks WHERE post_id = posts.id AND user_id = ?) THEN 1 ELSE 0 END AS saved
    FROM posts JOIN users ON users.id = posts.author_id
    LEFT JOIN communities ON communities.id = posts.community_id
    ORDER BY posts.created_at DESC`).all(viewerId ?? "", viewerId ?? "", viewerId ?? "") as FeedRow[];
}

export function getFeed(mode: FeedMode, viewerId?: string): FeedPost[] {
  const rows = rowsFor(viewerId);
  const extras = new Map(rows.map((row) => [row.id, row]));
  const candidates = rows.map((row) => ({
    id: row.id, authorId: row.author_id, communityId: row.community_id ?? undefined, body: row.body, createdAt: row.created_at,
    visibility: row.visibility, media: row.media_type && row.media_title ? { type: row.media_type, title: row.media_title } : undefined,
    reactions: Number(row.reaction_count), comments: Number(row.comment_count), reposts: Number(row.repost_count), saves: Number(row.save_count),
    authorAffinity: row.author_affinity, communityName: row.community_name ?? undefined
  }));
  const ordered = mode === "latest" ? chronologicalPosts(candidates) : rankPosts(candidates);
  return ordered.map((post) => {
    const row = extras.get(post.id)!;
    return { ...post, reacted: Boolean(row.reacted), reposted: Boolean(row.reposted), saved: Boolean(row.saved) };
  });
}

export function createPost(userId: string, body: string): FeedPost {
  const id = `p-${randomUUID()}`;
  database.prepare("INSERT INTO posts (id, body, visibility, created_at, author_id, community_id) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, body, "public", new Date().toISOString(), userId, "c-systems");
  return getFeed("ranked", userId).find((post) => post.id === id)!;
}

export function toggleReaction(postId: string, userId: string) {
  const post = database.prepare("SELECT id FROM posts WHERE id = ?").get(postId) as { id: string } | undefined;
  if (!post) return null;
  const existing = database.prepare("SELECT post_id FROM reactions WHERE post_id = ? AND user_id = ?").get(postId, userId);
  if (existing) database.prepare("DELETE FROM reactions WHERE post_id = ? AND user_id = ?").run(postId, userId);
  else database.prepare("INSERT INTO reactions (user_id, post_id, created_at) VALUES (?, ?, ?)").run(userId, postId, new Date().toISOString());
  const count = database.prepare("SELECT COUNT(*) AS count FROM reactions WHERE post_id = ?").get(postId) as { count: number };
  return { postId, reacted: !existing, reactions: Number(count.count) };
}

function toggleRelation(table: "bookmarks" | "reposts", postId: string, userId: string) {
  const post = database.prepare("SELECT id FROM posts WHERE id = ?").get(postId) as { id: string } | undefined;
  if (!post) return null;
  const existing = database.prepare(`SELECT post_id FROM ${table} WHERE post_id = ? AND user_id = ?`).get(postId, userId);
  if (existing) database.prepare(`DELETE FROM ${table} WHERE user_id = ? AND post_id = ?`).run(userId, postId);
  else database.prepare(`INSERT INTO ${table} (user_id, post_id, created_at) VALUES (?, ?, ?)`).run(userId, postId, new Date().toISOString());
  const count = database.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE post_id = ?`).get(postId) as { count: number };
  return { postId, active: !existing, count: Number(count.count) };
}

export function toggleBookmark(postId: string, userId: string) { return toggleRelation("bookmarks", postId, userId); }
export function toggleRepost(postId: string, userId: string) { return toggleRelation("reposts", postId, userId); }

export function createComment(postId: string, userId: string, body: string) {
  const post = database.prepare("SELECT id FROM posts WHERE id = ?").get(postId) as { id: string } | undefined;
  if (!post) return null;
  const id = `c-${randomUUID()}`;
  database.prepare("INSERT INTO comments (id, body, user_id, post_id, created_at) VALUES (?, ?, ?, ?, ?)").run(id, body, userId, postId, new Date().toISOString());
  return { id, postId, body };
}
