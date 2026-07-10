# Feed Simulation C++ Module

This module models the feed fanout tradeoff that large social systems need to solve.

The simulator compares:

- precomputed inbox writes for normal creators
- read-time merges for very large creators
- rough p95 latency pressure from both paths

This is not the product backend. It is a focused systems artifact for interview discussion and performance experimentation.

Build:

```bash
cmake -S services/feed-sim-cpp -B services/feed-sim-cpp/build
cmake --build services/feed-sim-cpp/build
```

Run:

```bash
services/feed-sim-cpp/build/feed_sim
```
