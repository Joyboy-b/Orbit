# Orbit Architecture

## Product Surface

Orbit is a social platform with:

- home feed
- ranked and chronological timeline modes
- creator profiles
- communities
- posts with text, media, and link metadata
- comments and reactions
- notifications
- discovery recommendations

## API Boundary

The web application exposes typed route handlers for the demo:

- `GET /api/feed?mode=ranked|latest` returns feed posts with ranking explanations and viewer reaction state.
- `POST /api/posts` validates and creates a post.
- `POST /api/posts/:postId/reactions` toggles a viewer reaction and returns the authoritative count.

The current repository is in-memory to keep local setup frictionless. The route handlers depend on a small feed-store interface, so a PostgreSQL implementation can replace it without changing the client-facing contract.
## Data Model

Core entities:

- `User`
- `Follow`
- `Community`
- `CommunityMember`
- `Post`
- `Comment`
- `Reaction`
- `Save`
- `Notification`
- `FeedEvent`

The relational model is deliberate. PostgreSQL makes it easy to represent identity, privacy, membership, engagement, and idempotency constraints.

## Feed Architecture

The MVP uses fanout-on-read:

1. Load viewer follow graph and communities.
2. Fetch candidate posts.
3. Filter by visibility.
4. Score candidate posts.
5. Return a ranked or chronological feed.

At scale, Orbit can move hot-path feeds to hybrid fanout:

- fanout-on-write for celebrity/following timelines where precomputation helps
- fanout-on-read for large creators where write amplification would explode
- cache ranked feed pages for active users
- invalidate affected feed windows after new post or engagement events

## Ranking Signals

Ranking starts explainable on purpose:

- recency
- affinity between viewer and author
- community membership
- reaction count
- comment count
- repost count
- media richness
- freshness penalties

The Python service mirrors this scoring model so ranking can be tested and tuned separately from the web app.

## Async Jobs

Background work candidates:

- notification delivery
- trending topic aggregation
- feed materialization
- weekly creator/community digest
- spam scoring
- media processing

## System Boundaries

The TypeScript app owns product workflows. Python owns ranking experiments. C++ owns performance simulations where memory layout, graph traversal, and latency modeling matter.
