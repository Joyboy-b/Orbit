import type { Community, Post, User } from "./types";

export const viewer = {
  id: "u-viewer",
  name: "Hideo",
  handle: "hideo",
  role: "SWE candidate building social systems"
};

export const users: User[] = [
  {
    id: "u-ava",
    name: "Ava Chen",
    handle: "avachen",
    role: "Feed infra engineer",
    followers: 128400,
    following: 402,
    affinity: 0.92
  },
  {
    id: "u-marcus",
    name: "Marcus Reed",
    handle: "mreed",
    role: "Creator tools PM",
    followers: 84200,
    following: 880,
    affinity: 0.76
  },
  {
    id: "u-sam",
    name: "Sam Rivera",
    handle: "samstack",
    role: "Ranking researcher",
    followers: 213000,
    following: 310,
    affinity: 0.84
  },
  {
    id: "u-nina",
    name: "Nina Patel",
    handle: "ninap",
    role: "Realtime systems lead",
    followers: 64100,
    following: 521,
    affinity: 0.68
  }
];

export const communities: Community[] = [
  {
    id: "c-systems",
    name: "Systems Design",
    members: 182000,
    description: "Architecture notes, scaling tradeoffs, and production stories."
  },
  {
    id: "c-creators",
    name: "Creator Graph",
    members: 94000,
    description: "Feeds, subscriptions, discovery, and creator analytics."
  },
  {
    id: "c-frontend",
    name: "Frontend Quality",
    members: 76000,
    description: "Interaction polish, accessibility, and performance."
  }
];

export const posts: Post[] = [
  {
    id: "p-1",
    authorId: "u-ava",
    communityId: "c-systems",
    body:
      "A hybrid feed is usually the grown-up answer: precompute normal accounts, merge large creators at read time, then do a final personalized ranking pass.",
    createdAt: "2026-07-09T12:45:00.000Z",
    visibility: "public",
    media: { type: "image", title: "Fanout strategy whiteboard" },
    reactions: 1840,
    comments: 142,
    reposts: 390,
    saves: 612
  },
  {
    id: "p-2",
    authorId: "u-sam",
    communityId: "c-creators",
    body:
      "Explainable ranking is underrated. If the team cannot explain why a post ranked first, debugging trust and quality problems becomes guesswork.",
    createdAt: "2026-07-09T10:15:00.000Z",
    visibility: "public",
    reactions: 920,
    comments: 88,
    reposts: 174,
    saves: 481
  },
  {
    id: "p-3",
    authorId: "u-nina",
    communityId: "c-systems",
    body:
      "Notification jobs need idempotency from day one. Retries are inevitable; duplicate notifications are a product bug disguised as an infra detail.",
    createdAt: "2026-07-08T22:40:00.000Z",
    visibility: "followers",
    reactions: 705,
    comments: 61,
    reposts: 80,
    saves: 201
  },
  {
    id: "p-4",
    authorId: "u-marcus",
    communityId: "c-frontend",
    body:
      "The fastest feed still feels broken if optimistic likes, comment counts, and loading states drift out of sync. Product quality lives in the edges.",
    createdAt: "2026-07-09T13:05:00.000Z",
    visibility: "public",
    media: { type: "link", title: "Interaction quality checklist" },
    reactions: 660,
    comments: 49,
    reposts: 96,
    saves: 254
  }
];
