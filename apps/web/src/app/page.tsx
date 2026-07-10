import { FeedClient } from "@/components/feed-client";
import { getCurrentUser } from "@/lib/auth";
import { getFeed } from "@/lib/feed-store";
import { communities, users, viewer } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessionUser = await getCurrentUser();
  const activeViewer = sessionUser
    ? { id: sessionUser.id, name: sessionUser.name, handle: sessionUser.handle, role: "Orbit member" }
    : viewer;

  return <FeedClient initialPosts={getFeed("ranked", sessionUser?.id)} viewer={activeViewer} users={users} communities={communities} sessionUser={sessionUser ? { id: sessionUser.id, name: sessionUser.name, handle: sessionUser.handle } : null} />;
}
