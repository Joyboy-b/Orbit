import bcrypt from "bcryptjs";
import { mkdirSync } from "fs";
import { join } from "path";
import { DatabaseSync } from "node:sqlite";
import { communities, posts, users, viewer } from "./seed";

const globalForDatabase = globalThis as unknown as { orbitDatabase?: DatabaseSync };

function createDatabase() {
  const dataDirectory = join(process.cwd(), "data");
  mkdirSync(dataDirectory, { recursive: true });
  const database = new DatabaseSync(join(dataDirectory, "orbit.db"));

  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      handle TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      affinity REAL NOT NULL DEFAULT 0.3, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, members INTEGER NOT NULL,
      description TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, body TEXT NOT NULL, visibility TEXT NOT NULL,
      media_type TEXT, media_title TEXT, created_at TEXT NOT NULL,
      author_id TEXT NOT NULL, community_id TEXT,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS reactions (
      user_id TEXT NOT NULL, post_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id TEXT NOT NULL, post_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS reposts (
      user_id TEXT NOT NULL, post_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY, body TEXT NOT NULL, user_id TEXT NOT NULL,
      post_id TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS posts_author_created_at ON posts(author_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS posts_community_created_at ON posts(community_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS reactions_post_id ON reactions(post_id);
    CREATE INDEX IF NOT EXISTS comments_post_created_at ON comments(post_id, created_at);
  `);

  const passwordHash = bcrypt.hashSync("orbit-demo-2026", 12);
  const insertUser = database.prepare(`INSERT OR IGNORE INTO users
    (id, name, email, handle, password_hash, affinity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertCommunity = database.prepare(`INSERT OR IGNORE INTO communities
    (id, name, members, description) VALUES (?, ?, ?, ?)`);
  const insertPost = database.prepare(`INSERT OR IGNORE INTO posts
    (id, body, visibility, media_type, media_title, created_at, author_id, community_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

  for (const user of [{ ...viewer, followers: 0, following: 0, affinity: 1 }, ...users]) {
    insertUser.run(user.id, user.name, `${user.handle}@orbit.local`, user.handle, passwordHash, user.affinity, new Date().toISOString());
  }
  for (const community of communities) {
    insertCommunity.run(community.id, community.name, community.members, community.description);
  }
  for (const post of posts) {
    insertPost.run(post.id, post.body, post.visibility, post.media?.type ?? null, post.media?.title ?? null, post.createdAt, post.authorId, post.communityId ?? null);
  }

  return database;
}

export const database = globalForDatabase.orbitDatabase ?? createDatabase();
if (process.env.NODE_ENV !== "production") globalForDatabase.orbitDatabase = database;
