# Orbit

Orbit is a full-stack social platform built as an engineering portfolio project. It models the product and systems behind modern feed-driven applications: personalized timelines, creator profiles, communities, engagement, notifications, and discovery.

Rather than being a visual clone, Orbit is designed to give its builder credible implementation and system-design stories for social products at YouTube, Instagram, Facebook, X, and similar platforms.

## What It Demonstrates

- A polished Next.js and TypeScript product surface with feed, profile, community, post, comment, notification, and discovery experiences.
- Two feed modes: reverse-chronological for predictable delivery and ranked for personalized discovery.
- An explainable Python ranking prototype, with independently testable scoring signals such as recency, viewer-author affinity, community membership, and engagement.
- A C++ feed simulator for reasoning about social-graph fanout, cache pressure, latency, and the tradeoffs between fanout-on-read and fanout-on-write.
- A production-minded data model and system boundary plan for PostgreSQL, caching, asynchronous work, privacy, and idempotency.

## Architecture

```text
Next.js + TypeScript                 Python                         C++
Product workflows, UI, and API  ->  Ranking experiments       ->  Feed-scale simulation
                                    and scoring tests              and performance tradeoffs
```

The TypeScript application owns product behavior. The Python service isolates ranking iteration from the UI layer. The C++ program is reserved for performance-oriented simulations, where graph traversal and memory behavior are useful to study directly.

The MVP follows a fanout-on-read approach:

1. Load the viewer's follow graph and communities.
2. Fetch eligible post candidates.
3. Enforce visibility and membership rules.
4. Score candidates or order them by time.
5. Return a feed page.

At larger scale, the intended evolution is hybrid fanout: precompute feeds where it is economical, keep large-creator feeds read-time, cache active feed windows, and use background workers for notifications, trending, media processing, and ranking refreshes.

## Technology

| Area | Stack | Purpose |
| --- | --- | --- |
| Web application | Next.js 16, React 19, TypeScript | Product workflows and interactive social UI |
| Ranking | Python | Fast iteration on measurable, testable feed scoring |
| Systems simulation | C++ and CMake | Exploring feed fanout and performance tradeoffs |
| Planned production data | PostgreSQL, Prisma, Auth.js | Identity, relationships, privacy, and durable data |
| Planned infrastructure | Redis-compatible cache and background jobs | Feed caching, notifications, trending, and async work |

## Run Locally

Prerequisites: Node.js, npm, and Python. A C++ compiler is only needed for the simulator.

```bash
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

Run the checks:

```bash
npm run lint
npm run build
npm run test:python
```

Build the C++ simulator after installing a C++ compiler:

```bash
npm run build:cpp
```

## Repository Layout

```text
apps/web/                     Next.js application
services/ranking-python/      Ranking prototype and tests
services/feed-sim-cpp/        C++ feed simulation
docs/architecture.md          Data model and feed architecture
docs/scaling.md               Scaling notes and tradeoffs
```

## Core Product Concepts

- **Social graph:** users, follows, communities, and community membership.
- **Content graph:** posts, comments, reactions, saves, and visibility rules.
- **Feed ranking:** explainable signals before introducing opaque models, so experiments can be measured and tuned safely.
- **Reliability:** idempotent writes, cache boundaries, and background jobs are first-class design concerns.
- **Scale:** the architecture makes deliberate tradeoffs between write amplification, read latency, cache efficiency, and creator size.

Read the [architecture notes](docs/architecture.md) for the data model and feed design, and the [scaling notes](docs/scaling.md) for the larger-system discussion.
