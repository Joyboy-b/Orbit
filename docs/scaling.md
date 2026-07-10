# Scaling Orbit to 100M Users

## Feed Generation

Small accounts can use fanout-on-write because each post writes to a manageable number of follower inboxes. Large creators need fanout-on-read because writing a post to millions of inboxes creates huge write amplification.

Orbit should use a hybrid strategy:

- normal users: precompute follower inbox entries
- large creators: merge their posts at read time
- communities: cache community feed pages by active sort mode
- viewer personalization: apply final lightweight ranking at read time

## Storage

PostgreSQL remains the source of truth for users, posts, relationships, comments, reactions, and notifications. High-volume append-only events can move to a log pipeline later.

Useful indexes:

- `posts(author_id, created_at desc)`
- `posts(community_id, created_at desc)`
- `follows(follower_id, following_id)`
- `reactions(post_id, user_id)`
- `comments(post_id, created_at)`
- `notifications(user_id, created_at desc, read_at)`

## Caching

Cache:

- first page of home feed
- community feed pages
- profile summary counts
- trending topics
- session/user lookup
- rate-limit counters

Avoid caching raw personalized results without including viewer identity and privacy versioning in the cache key.

## Reliability

Important safeguards:

- idempotency keys for reactions, reposts, and notification jobs
- transactional writes for post + event creation
- retryable background jobs
- deduped notification records
- rate limits for post creation, comments, reactions, and follows

## Interview Talking Points

- Why hybrid fanout beats a single strategy
- How privacy rules affect cache keys
- How to rank feeds without making them impossible to debug
- How to prevent duplicate likes under concurrent requests
- How to degrade gracefully when ranking or notification workers are down
