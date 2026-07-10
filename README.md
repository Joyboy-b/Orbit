# Orbit

Orbit is a portfolio-grade social feed platform designed to showcase the engineering skills behind products like Instagram, Facebook, Twitter/X, and YouTube.

The project is intentionally split into three layers:

- `apps/web`: a Next.js + TypeScript product surface for feeds, profiles, communities, posts, comments, ranking explanations, and notifications.
- `services/ranking-python`: a Python ranking service prototype for recommendation scoring and experimentation.
- `services/feed-sim-cpp`: a C++ feed simulation for graph fanout, cache pressure, and latency tradeoff discussion.

## Why This Project Is Strong

Orbit is not just a UI clone. It gives you concrete interview stories around:

- social graph modeling
- timeline generation
- feed ranking
- optimistic UI
- privacy-aware queries
- notification pipelines
- caching and rate limits
- async background work
- system design at large scale
- using TypeScript, Python, and C++ where each language makes sense

## Local Development

Install dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run dev
```

Run the Python ranking tests:

```bash
npm run test:python
```

Build the C++ simulator, after installing a C++ compiler:

```bash
npm run build:cpp
```

## Backend Direction

The MVP starts with typed seed data and pure service functions so the product can move quickly. The planned production backend is:

- Next.js route handlers/server actions
- PostgreSQL
- Prisma
- Auth.js
- Redis or Upstash-compatible cache abstraction
- background jobs for notifications, trending, and ranking refreshes

See [docs/architecture.md](docs/architecture.md) and [docs/scaling.md](docs/scaling.md).
