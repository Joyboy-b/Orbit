"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Bell,
  Bookmark,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  LoaderCircle,
  MessageCircle,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Users,
  Video
} from "lucide-react";
import type { Community, FeedMode, FeedPost, User } from "@/lib/types";

type FeedClientProps = {
  initialPosts: FeedPost[];
  viewer: { id: string; name: string; handle: string; role: string };
  users: User[];
  communities: Community[];
};

export function FeedClient({
  initialPosts,
  viewer,
  users,
  communities
}: FeedClientProps) {
  const [mode, setMode] = useState<FeedMode>("ranked");
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingReactions, setPendingReactions] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);

  const userById = useMemo(() => {
    const currentUser: User = {
      ...viewer,
      followers: 0,
      following: 0,
      affinity: 1
    };
    return new Map([...users, currentUser].map((user) => [user.id, user]));
  }, [users, viewer]);

  const communityById = useMemo(
    () => new Map(communities.map((community) => [community.id, community])),
    [communities]
  );

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return posts;

    return posts.filter((post) => {
      const author = userById.get(post.authorId);
      const community = post.communityId
        ? communityById.get(post.communityId)
        : undefined;
      return [post.body, author?.name, author?.handle, community?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [communityById, posts, query, userById]);

  async function loadFeed(nextMode: FeedMode) {
    setMode(nextMode);
    setIsLoading(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/feed?mode=${nextMode}`);
      if (!response.ok) throw new Error("Unable to load the feed.");
      const payload = (await response.json()) as { posts: FeedPost[] };
      setPosts(payload.posts);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load the feed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || isPublishing) return;

    setIsPublishing(true);
    setNotice(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to publish post.");

      setDraft("");
      setNotice("Post published to Systems Design.");
      await loadFeed(mode);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to publish post.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function toggleLike(post: FeedPost) {
    if (pendingReactions.has(post.id)) return;

    const previousPost = post;
    const nextReacted = !post.reacted;
    setPendingReactions((current) => new Set(current).add(post.id));
    setPosts((current) =>
      current.map((candidate) =>
        candidate.id === post.id
          ? {
              ...candidate,
              reacted: nextReacted,
              reactions: Math.max(0, candidate.reactions + (nextReacted ? 1 : -1))
            }
          : candidate
      )
    );

    try {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Unable to update reaction.");
      const payload = (await response.json()) as {
        reacted: boolean;
        reactions: number;
      };
      setPosts((current) =>
        current.map((candidate) =>
          candidate.id === post.id
            ? { ...candidate, reacted: payload.reacted, reactions: payload.reactions }
            : candidate
        )
      );
    } catch {
      setPosts((current) =>
        current.map((candidate) =>
          candidate.id === previousPost.id ? previousPost : candidate
        )
      );
      setNotice("Reaction could not be saved. Please try again.");
    } finally {
      setPendingReactions((current) => {
        const next = new Set(current);
        next.delete(post.id);
        return next;
      });
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <span>Orbit</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <button className="active" title="Home"><Home size={20} /><span>Home</span></button>
          <button title="Discover"><Compass size={20} /><span>Discover</span></button>
          <button title="Communities"><Users size={20} /><span>Communities</span></button>
          <button title="Notifications"><Bell size={20} /><span>Notifications</span></button>
          <button title="Saved"><Bookmark size={20} /><span>Saved</span></button>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <label className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts, people, communities"
              aria-label="Search posts, people, communities"
            />
          </label>
          <div className="segmented" aria-label="Feed mode">
            <button className={mode === "ranked" ? "active" : ""} onClick={() => loadFeed("ranked")}>Ranked</button>
            <button className={mode === "latest" ? "active" : ""} onClick={() => loadFeed("latest")}>Latest</button>
          </div>
        </div>

        <form className="composer" onSubmit={publishPost} aria-label="Create post">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={500}
            placeholder="Share a systems insight, product idea, or launch note"
          />
          <div className="composer-actions">
            <div className="tool-row">
              <button className="icon-button" type="button" title="Add image" disabled><ImageIcon size={18} /></button>
              <button className="icon-button" type="button" title="Add video" disabled><Video size={18} /></button>
              <span className="composer-context"><Users size={16} /> Systems Design</span>
            </div>
            <button className="primary-button" type="submit" disabled={!draft.trim() || isPublishing}>
              {isPublishing ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
              Publish
            </button>
          </div>
          <div className="composer-footer"><span>{draft.length}/500</span>{notice ? <span role="status">{notice}</span> : null}</div>
        </form>

        <section className="feed" aria-label={`${mode} feed`} aria-busy={isLoading}>
          {isLoading ? <div className="feed-state"><LoaderCircle className="spin" size={20} /> Refreshing feed</div> : null}
          {!isLoading && visiblePosts.length === 0 ? <div className="feed-state">No posts match that search yet.</div> : null}
          {visiblePosts.map((post) => {
            const author = userById.get(post.authorId);
            const community = post.communityId ? communityById.get(post.communityId) : undefined;
            return (
              <article className="post" key={post.id}>
                <header className="post-header">
                  <div className="avatar">{author?.name.slice(0, 1)}</div>
                  <div><strong>{author?.name}</strong><div className="handle">@{author?.handle} · {community?.name ?? "Orbit"}</div></div>
                  <div className="score-pill"><Sparkles size={14} /> {post.score.toFixed(0)}</div>
                </header>
                <p className="post-body">{post.body}</p>
                {post.media ? <div className="media"><strong>{post.media.title}</strong><span>{post.media.type.toUpperCase()} preview</span></div> : null}
                <div className="explain">Ranked by {post.explanation.join(" · ")}</div>
                <footer className="post-actions">
                  <div className="metrics"><span>{post.reactions.toLocaleString()} likes</span><span>{post.comments.toLocaleString()} comments</span><span>{post.reposts.toLocaleString()} reposts</span></div>
                  <div className="tool-row">
                    <button className={`icon-button ${post.reacted ? "reacted" : ""}`} onClick={() => toggleLike(post)} disabled={pendingReactions.has(post.id)} type="button" title={post.reacted ? "Remove like" : "Like"} aria-pressed={post.reacted}><Heart size={18} fill={post.reacted ? "currentColor" : "none"} /></button>
                    <button className="icon-button" type="button" title="Comment" disabled><MessageCircle size={18} /></button>
                    <button className="icon-button" type="button" title="Repost" disabled><Repeat2 size={18} /></button>
                    <button className="icon-button" type="button" title="Save" disabled><Bookmark size={18} /></button>
                  </div>
                </footer>
              </article>
            );
          })}
        </section>
      </main>

      <aside className="insights">
        <section className="profile-card"><h2>{viewer.name}</h2><p className="muted">@{viewer.handle}</p><p>{viewer.role}</p><div className="stat-grid"><div className="stat"><strong>{posts.filter((post) => post.authorId === viewer.id).length}</strong>posts</div><div className="stat"><strong>3</strong>loops</div><div className="stat"><strong>92</strong>score</div></div></section>
        <section className="panel"><h2>Trending Communities</h2><div className="trend-list">{communities.map((community) => <div className="trend" key={community.id}><strong>{community.name}</strong><span className="muted">{community.members.toLocaleString()} members</span></div>)}</div></section>
        <section className="panel"><h2>Backend Signals</h2><div className="notif-list"><div className="notif"><strong>Feed API</strong><span className="muted">Typed routes own feed reads and mutations.</span></div><div className="notif"><strong>Ranking service</strong><span className="muted">Python scoring prototype mirrors feed signals.</span></div><div className="notif"><strong>Feed simulator</strong><span className="muted">C++ module models fanout costs.</span></div></div></section>
      </aside>
    </div>
  );
}
