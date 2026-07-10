import { FeedClient } from "@/components/feed-client";
import { getFeed } from "@/lib/feed-store";
import { communities, users, viewer } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <FeedClient
      initialPosts={getFeed("ranked")}
      viewer={viewer}
      users={users}
      communities={communities}
    />
  );
}
