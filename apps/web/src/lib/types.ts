export type User = {
  id: string;
  name: string;
  handle: string;
  role: string;
  followers: number;
  following: number;
  affinity: number;
};

export type Community = {
  id: string;
  name: string;
  members: number;
  description: string;
};

export type Post = {
  id: string;
  authorId: string;
  communityId?: string;
  body: string;
  createdAt: string;
  visibility: "public" | "followers" | "community";
  media?: {
    type: "image" | "link" | "video";
    title: string;
  };
  reactions: number;
  comments: number;
  reposts: number;
  saves: number;
};

export type RankedPost = Post & {
  score: number;
  explanation: string[];
};

export type FeedPost = RankedPost & {
  reacted: boolean;
  reposted: boolean;
  saved: boolean;
};

export type FeedMode = "ranked" | "latest";

export type DiscoverUser = User & {
  followerCount: number;
  isFollowing: boolean;
};