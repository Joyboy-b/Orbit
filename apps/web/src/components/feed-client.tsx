"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell, Bookmark, Compass, Heart, Home, Image as ImageIcon, LoaderCircle,
  MessageCircle, Repeat2, Search, Send, Sparkles, Users, Video
} from "lucide-react";
import type { Community, DiscoverUser, FeedMode, FeedPost, NotificationItem, User } from "@/lib/types";

type Section = "home" | "discover" | "communities" | "notifications" | "saved";

type FeedClientProps = {
  initialPosts: FeedPost[];
  viewer: { id: string; name: string; handle: string; role: string };
  users: User[];
  communities: Community[];
  sessionUser: { id: string; name: string; handle: string } | null;
};

export function FeedClient({ initialPosts, viewer, users, communities, sessionUser }: FeedClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<FeedMode>("ranked");
  const [section, setSection] = useState<Section>("home");
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const userById = useMemo(() => {
    const currentUser: User = { ...viewer, followers: 0, following: 0, affinity: 1 };
    return new Map([...users, currentUser].map((user) => [user.id, user]));
  }, [users, viewer]);
  const communityById = useMemo(() => new Map(communities.map((community) => [community.id, community])), [communities]);

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (section === "saved" && !post.saved) return false;
      const author = userById.get(post.authorId);
      const community = post.communityId ? communityById.get(post.communityId) : undefined;
      if (!normalizedQuery) return true;
      return [post.body, author?.name, author?.handle, community?.name].filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [communityById, posts, query, section, userById]);

  useEffect(() => {
    if (section !== "discover") return;
    let active = true;    fetch("/api/discover")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load Discover.");
        return (await response.json()) as { users: DiscoverUser[] };
      })
      .then((payload) => { if (active) setDiscoverUsers(payload.users); })
      .catch((error) => { if (active) setNotice(error instanceof Error ? error.message : "Unable to load Discover."); })
      .finally(() => { if (active) setIsDiscoverLoading(false); });
    return () => { active = false; };
  }, [section]);

  useEffect(() => {
    if (section !== "notifications" || !sessionUser) return;
    let active = true;    fetch("/api/notifications")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load notifications.");
        return (await response.json()) as { notifications: NotificationItem[] };
      })
      .then((payload) => { if (active) setNotifications(payload.notifications); })
      .catch((error) => { if (active) setNotice(error instanceof Error ? error.message : "Unable to load notifications."); })
      .finally(() => { if (active) setIsNotificationsLoading(false); });
    return () => { active = false; };
  }, [section, sessionUser]);

  async function markAllNotificationsRead() {
    if (!sessionUser) { setNotice("Log in to manage notifications."); return; }
    const response = await fetch("/api/notifications/read", { method: "POST" });
    if (!response.ok) { setNotice("Unable to update notifications."); return; }
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setNotice("Notifications marked as read.");
  }
  async function toggleFollow(candidate: DiscoverUser) {
    if (!sessionUser) { setNotice("Log in to follow people."); return; }
    setDiscoverUsers((current) => current.map((user) => user.id === candidate.id ? { ...user, isFollowing: !user.isFollowing, followerCount: user.followerCount + (user.isFollowing ? -1 : 1) } : user));
    try {
      const response = await fetch(`/api/users/${candidate.id}/follow`, { method: "POST" });
      const payload = (await response.json()) as { error?: string; following?: boolean; followerCount?: number };
      if (!response.ok) throw new Error(payload.error ?? "Unable to update follow.");
      setDiscoverUsers((current) => current.map((user) => user.id === candidate.id ? { ...user, isFollowing: Boolean(payload.following), followerCount: payload.followerCount ?? user.followerCount } : user));
    } catch (error) {
      setDiscoverUsers((current) => current.map((user) => user.id === candidate.id ? candidate : user));
      setNotice(error instanceof Error ? error.message : "Unable to update follow.");
    }
  }
  async function loadFeed(nextMode: FeedMode) {
    setMode(nextMode); setIsLoading(true); setNotice(null);
    try {
      const response = await fetch(`/api/feed?mode=${nextMode}`);
      if (!response.ok) throw new Error("Unable to load the feed.");
      const payload = (await response.json()) as { posts: FeedPost[] };
      setPosts(payload.posts);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load the feed.");
    } finally { setIsLoading(false); }
  }

  function chooseSection(nextSection: Section) {
    if (nextSection === "discover") setIsDiscoverLoading(true);
    if (nextSection === "notifications") setIsNotificationsLoading(true);
    setSection(nextSection);
    setNotice(nextSection === "saved" ? "Showing posts you saved." : null);
  }

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionUser) { setNotice("Log in to publish a post."); return; }
    const body = draft.trim();
    if (!body || isPublishing) return;
    setIsPublishing(true); setNotice(null);
    try {
      const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to publish post.");
      setDraft(""); setNotice("Post published to Systems Design."); await loadFeed(mode);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to publish post.");
    } finally { setIsPublishing(false); }
  }

  async function toggleLike(post: FeedPost) {
    await runAction(post.id, `/api/posts/${post.id}/reactions`, "reacted", "reactions");
  }

  async function toggleBookmark(post: FeedPost) {
    await runAction(post.id, `/api/posts/${post.id}/bookmarks`, "saved", "saveCount");
  }

  async function toggleRepost(post: FeedPost) {
    await runAction(post.id, `/api/posts/${post.id}/reposts`, "reposted", "repostCount");
  }

  async function runAction(postId: string, endpoint: string, field: "reacted" | "saved" | "reposted", countField: "reactions" | "saveCount" | "repostCount") {
    if (!sessionUser) { setNotice("Log in to use this action."); return; }
    if (pendingActions.has(postId)) return;
    setPendingActions((current) => new Set(current).add(postId)); setNotice(null);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const payload = (await response.json()) as { error?: string; reacted?: boolean; active?: boolean; reactions?: number; count?: number };
      if (!response.ok) throw new Error(payload.error ?? "Unable to save that action.");
      const nextValue = field === "reacted" ? payload.reacted : payload.active;
      const nextCount = countField === "reactions" ? payload.reactions : payload.count;
      setPosts((current) => current.map((post) => post.id === postId ? {
        ...post,
        [field]: Boolean(nextValue),
        ...(nextCount === undefined ? {} : countField === "reactions" ? { reactions: nextCount } : countField === "saveCount" ? { saves: nextCount } : { reposts: nextCount })
      } : post));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save that action.");
    } finally {
      setPendingActions((current) => { const next = new Set(current); next.delete(postId); return next; });
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    if (!sessionUser) { setNotice("Log in to comment."); return; }
    const body = commentDraft.trim();
    if (!body) return;
    const response = await fetch(`/api/posts/${postId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) { setNotice(payload.error ?? "Unable to comment."); return; }
    setCommentDraft(""); setCommentingPost(null); setNotice("Comment added.");
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: post.comments + 1 } : post));
  }

  function showMediaMessage(kind: "image" | "video") {
    setNotice(`${kind === "image" ? "Image" : "Video"} uploads are ready for the next media-storage milestone.`);
  }

  const navItems: { id: Section; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Home", icon: Home }, { id: "discover", label: "Discover", icon: Compass },
    { id: "communities", label: "Communities", icon: Users }, { id: "notifications", label: "Notifications", icon: Bell },
    { id: "saved", label: "Saved", icon: Bookmark }
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><span>Orbit</span></div>
        <nav className="nav" aria-label="Primary">
          {navItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? "active" : ""} title={label} onClick={() => chooseSection(id)}><Icon size={20} /><span>{label}</span></button>)}
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <label className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts, people, communities" aria-label="Search posts, people, communities" /></label>
          <div className="topbar-actions">
            <div className="segmented" aria-label="Feed mode"><button type="button" className={mode === "ranked" ? "active" : ""} onClick={() => loadFeed("ranked")}>Ranked</button><button type="button" className={mode === "latest" ? "active" : ""} onClick={() => loadFeed("latest")}>Latest</button></div>
            {sessionUser ? <button className="secondary-button" type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/"); router.refresh(); }}>Log out</button> : <div className="auth-actions"><Link href="/login">Log in</Link><Link className="primary-button" href="/signup">Sign up</Link></div>}
          </div>
        </div>

        {section === "discover" ? (
          <section className="discover-view" aria-label="Discover people">
            <div className="section-heading"><div><span className="eyebrow">Social graph</span><h1>Find your people</h1><p>Follow builders whose ideas should shape your next ranked feed.</p></div><Compass size={24} /></div>
            {isDiscoverLoading ? <div className="feed-state"><LoaderCircle className="spin" size={20} /> Loading people</div> : null}
            {!isDiscoverLoading && discoverUsers.length === 0 ? <div className="feed-state">No new people to discover yet.</div> : null}
            <div className="directory-grid">{discoverUsers.map((candidate) => <article className="directory-card" key={candidate.id}><div className="directory-avatar">{candidate.name.slice(0, 1)}</div><div className="directory-copy"><strong>{candidate.name}</strong><span className="muted">@{candidate.handle}</span><p>Orbit builder with an interest in systems, products, and communities.</p><span className="muted">{candidate.followerCount.toLocaleString()} followers</span></div><button className={candidate.isFollowing ? "secondary-button" : "primary-button"} type="button" onClick={() => toggleFollow(candidate)}>{candidate.isFollowing ? "Following" : "Follow"}</button></article>)}</div>
          </section>
        ) : null}

        {section === "notifications" ? (
          <section className="notifications-view" aria-label="Notifications">
            <div className="section-heading"><div><span className="eyebrow">Activity</span><h1>Notifications</h1><p>Keep up with the people joining your orbit.</p></div><Bell size={24} /></div>
            <div className="notification-toolbar"><span className="muted">{notifications.filter((item) => !item.readAt).length} unread</span><button className="secondary-button" type="button" onClick={markAllNotificationsRead}>Mark all read</button></div>
            {isNotificationsLoading ? <div className="feed-state"><LoaderCircle className="spin" size={20} /> Loading notifications</div> : null}
            {!isNotificationsLoading && !sessionUser ? <div className="feed-state">Log in to view your notifications.</div> : null}
            {!isNotificationsLoading && sessionUser && notifications.length === 0 ? <div className="feed-state">You are all caught up.</div> : null}
            <div className="notification-list">{notifications.map((item) => <article className={`notification-item ${item.readAt ? "read" : "unread"}`} key={item.id}><div className="notification-icon"><Users size={18} /></div><div><strong>{item.actorName}</strong> started following you.<span className="muted">@{item.actorHandle} - {new Date(item.createdAt).toLocaleString()}</span></div></article>)}</div>
          </section>
        ) : null}

        {section !== "discover" && section !== "notifications" ? (<><form className="composer" onSubmit={publishPost} aria-label="Create post">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} disabled={!sessionUser} placeholder={sessionUser ? "Share a systems insight, product idea, or launch note" : "Log in to share a systems insight"} />
          <div className="composer-actions"><div className="tool-row"><button className="icon-button" type="button" title="Add image" onClick={() => showMediaMessage("image")}><ImageIcon size={18} /></button><button className="icon-button" type="button" title="Add video" onClick={() => showMediaMessage("video")}><Video size={18} /></button><span className="composer-context"><Users size={16} /> Systems Design</span></div><button className="primary-button" type="submit" disabled={!draft.trim() || isPublishing || !sessionUser}>{isPublishing ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}Publish</button></div>
          <div className="composer-footer"><span>{draft.length}/500</span>{notice ? <span role="status">{notice}</span> : null}</div>
        </form>

        <section className="feed" aria-label={`${mode} feed`} aria-busy={isLoading}>
          {isLoading ? <div className="feed-state"><LoaderCircle className="spin" size={20} /> Refreshing feed</div> : null}
          {!isLoading && visiblePosts.length === 0 ? <div className="feed-state">{section === "saved" ? "You have not saved any posts yet." : "No posts match that search yet."}</div> : null}
          {visiblePosts.map((post) => {
            const author = userById.get(post.authorId); const community = post.communityId ? communityById.get(post.communityId) : undefined;
            return <article className="post" key={post.id}>
              <header className="post-header"><div className="avatar">{author?.name.slice(0, 1)}</div><div><strong>{author?.name}</strong><div className="handle">@{author?.handle} - {community?.name ?? "Orbit"}</div></div><div className="score-pill"><Sparkles size={14} /> {post.score.toFixed(0)}</div></header>
              <p className="post-body">{post.body}</p>
              {post.media ? <div className="media"><strong>{post.media.title}</strong><span>{post.media.type.toUpperCase()} preview</span></div> : null}
              <div className="explain">Ranked by {post.explanation.join(" | ")}</div>
              <footer className="post-actions"><div className="metrics"><span>{post.reactions.toLocaleString()} likes</span><span>{post.comments.toLocaleString()} comments</span><span>{post.reposts.toLocaleString()} reposts</span></div><div className="tool-row"><button className={`icon-button ${post.reacted ? "reacted" : ""}`} onClick={() => toggleLike(post)} disabled={pendingActions.has(post.id)} type="button" title={post.reacted ? "Remove like" : "Like"} aria-pressed={post.reacted}><Heart size={18} fill={post.reacted ? "currentColor" : "none"} /></button><button className="icon-button" type="button" title="Comment" onClick={() => setCommentingPost(commentingPost === post.id ? null : post.id)}><MessageCircle size={18} /></button><button className={`icon-button ${post.reposted ? "reacted" : ""}`} type="button" title="Repost" onClick={() => toggleRepost(post)} disabled={pendingActions.has(post.id)}><Repeat2 size={18} /></button><button className={`icon-button ${post.saved ? "reacted" : ""}`} type="button" title={post.saved ? "Remove save" : "Save"} onClick={() => toggleBookmark(post)} disabled={pendingActions.has(post.id)}><Bookmark size={18} fill={post.saved ? "currentColor" : "none"} /></button></div></footer>
              {commentingPost === post.id ? <form className="comment-form" onSubmit={(event) => submitComment(event, post.id)}><input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={280} autoFocus placeholder={sessionUser ? "Add a thoughtful comment" : "Log in to comment"} disabled={!sessionUser} /><button className="primary-button" type="submit" disabled={!sessionUser || !commentDraft.trim()}><Send size={16} /> Comment</button></form> : null}
            </article>;
          })}
        </section>
        </>) : null}
      </main>

      <aside className="insights"><section className="profile-card"><h2>{viewer.name}</h2><p className="muted">@{viewer.handle}</p><p>{viewer.role}</p><div className="stat-grid"><div className="stat"><strong>{posts.filter((post) => post.authorId === viewer.id).length}</strong>posts</div><div className="stat"><strong>3</strong>loops</div><div className="stat"><strong>92</strong>score</div></div></section><section className="panel"><h2>Trending Communities</h2><div className="trend-list">{communities.map((community) => <div className="trend" key={community.id}><strong>{community.name}</strong><span className="muted">{community.members.toLocaleString()} members</span></div>)}</div></section><section className="panel"><h2>Backend Signals</h2><div className="notif-list"><div className="notif"><strong>SQLite database</strong><span className="muted">Users, sessions, posts, reactions, comments, saves, and reposts.</span></div><div className="notif"><strong>Authenticated mutations</strong><span className="muted">Every write checks the Orbit session cookie.</span></div><div className="notif"><strong>Ranking service</strong><span className="muted">Python scoring prototype mirrors feed signals.</span></div></div></section></aside>
    </div>
  );
}
