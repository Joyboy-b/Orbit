import {
  Bell,
  Bookmark,
  Compass,
  Heart,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Users,
  Video
} from "lucide-react";
import { chronologicalPosts, rankPosts } from "@/lib/ranking";
import { communities, posts, users, viewer } from "@/lib/seed";

const rankedFeed = rankPosts(posts);
const latestFeed = chronologicalPosts(posts);

export default function HomePage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={19} />
          </div>
          <span>Orbit</span>
        </div>

        <nav className="nav" aria-label="Primary">
          <button className="active" title="Home">
            <Home size={20} />
            <span>Home</span>
          </button>
          <button title="Discover">
            <Compass size={20} />
            <span>Discover</span>
          </button>
          <button title="Communities">
            <Users size={20} />
            <span>Communities</span>
          </button>
          <button title="Notifications">
            <Bell size={20} />
            <span>Notifications</span>
          </button>
          <button title="Saved">
            <Bookmark size={20} />
            <span>Saved</span>
          </button>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <label className="search">
            <Search size={18} />
            <input placeholder="Search posts, people, communities" />
          </label>
          <div className="segmented" aria-label="Feed mode">
            <button className="active">Ranked</button>
            <button>Latest</button>
          </div>
        </div>

        <section className="composer" aria-label="Create post">
          <textarea placeholder="Share a systems insight, product idea, or launch note" />
          <div className="composer-actions">
            <div className="tool-row">
              <button className="icon-button" title="Add image">
                <ImageIcon size={18} />
              </button>
              <button className="icon-button" title="Add video">
                <Video size={18} />
              </button>
              <button className="secondary-button">
                <Users size={18} />
                Systems Design
              </button>
            </div>
            <button className="primary-button">
              <Send size={18} />
              Publish
            </button>
          </div>
        </section>

        <section className="feed" aria-label="Ranked feed">
          {rankedFeed.map((post) => {
            const author = users.find((user) => user.id === post.authorId);
            const community = communities.find(
              (item) => item.id === post.communityId
            );

            return (
              <article className="post" key={post.id}>
                <header className="post-header">
                  <div className="avatar">{author?.name.slice(0, 1)}</div>
                  <div>
                    <strong>{author?.name}</strong>
                    <div className="handle">
                      @{author?.handle} · {community?.name}
                    </div>
                  </div>
                  <div className="score-pill">
                    <Sparkles size={14} />
                    {post.score.toFixed(0)}
                  </div>
                </header>

                <p className="post-body">{post.body}</p>

                {post.media ? (
                  <div className="media">
                    <strong>{post.media.title}</strong>
                    <span>{post.media.type.toUpperCase()} preview</span>
                  </div>
                ) : null}

                <div className="explain">
                  Ranked by {post.explanation.join(" · ")}
                </div>

                <footer className="post-actions">
                  <div className="metrics">
                    <span>{post.reactions.toLocaleString()} likes</span>
                    <span>{post.comments.toLocaleString()} comments</span>
                    <span>{post.reposts.toLocaleString()} reposts</span>
                  </div>
                  <div className="tool-row">
                    <button className="icon-button" title="Like">
                      <Heart size={18} />
                    </button>
                    <button className="icon-button" title="Comment">
                      <MessageCircle size={18} />
                    </button>
                    <button className="icon-button" title="Repost">
                      <Repeat2 size={18} />
                    </button>
                    <button className="icon-button" title="Save">
                      <Bookmark size={18} />
                    </button>
                  </div>
                </footer>
              </article>
            );
          })}
        </section>
      </main>

      <aside className="insights">
        <section className="profile-card">
          <h2>{viewer.name}</h2>
          <p className="muted">@{viewer.handle}</p>
          <p>{viewer.role}</p>
          <div className="stat-grid">
            <div className="stat">
              <strong>4</strong>
              posts
            </div>
            <div className="stat">
              <strong>3</strong>
              loops
            </div>
            <div className="stat">
              <strong>92</strong>
              score
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Trending Communities</h2>
          <div className="trend-list">
            {communities.map((community) => (
              <div className="trend" key={community.id}>
                <strong>{community.name}</strong>
                <span className="muted">
                  {community.members.toLocaleString()} members
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Backend Signals</h2>
          <div className="notif-list">
            <div className="notif">
              <strong>Ranking service</strong>
              <span className="muted">Python scoring prototype mirrors feed.</span>
            </div>
            <div className="notif">
              <strong>Feed simulator</strong>
              <span className="muted">C++ module models fanout costs.</span>
            </div>
            <div className="notif">
              <strong>Next backend</strong>
              <span className="muted">Ready for Postgres, Prisma, Auth.js.</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Latest Mode Preview</h2>
          <div className="trend-list">
            {latestFeed.slice(0, 3).map((post) => {
              const author = users.find((user) => user.id === post.authorId);
              return (
                <div className="trend" key={post.id}>
                  <strong>@{author?.handle}</strong>
                  <span className="muted">{post.body.slice(0, 72)}...</span>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
