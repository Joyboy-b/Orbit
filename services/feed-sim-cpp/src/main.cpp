#include <algorithm>
#include <chrono>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>

struct Creator {
    std::string id;
    int followers;
    bool celebrity;
};

struct SimulationResult {
    long long precomputedWrites;
    long long readTimeMerges;
    double estimatedP95Ms;
};

SimulationResult simulateHybridFanout(const std::vector<Creator>& creators) {
    long long precomputedWrites = 0;
    long long readTimeMerges = 0;

    for (const auto& creator : creators) {
        if (creator.celebrity || creator.followers > 1'000'000) {
            readTimeMerges += creator.followers;
        } else {
            precomputedWrites += creator.followers;
        }
    }

    const double writeCostMs = precomputedWrites / 250'000.0;
    const double mergeCostMs = readTimeMerges / 2'000'000.0;

    return {
        precomputedWrites,
        readTimeMerges,
        18.0 + writeCostMs + mergeCostMs,
    };
}

std::vector<Creator> makeCreators(int count) {
    std::mt19937 rng(42);
    std::lognormal_distribution<double> followerDistribution(10.2, 1.25);
    std::vector<Creator> creators;
    creators.reserve(count);

    for (int i = 0; i < count; ++i) {
        int followers = static_cast<int>(followerDistribution(rng));
        followers = std::clamp(followers, 100, 15'000'000);
        creators.push_back({
            "creator-" + std::to_string(i),
            followers,
            followers > 1'000'000,
        });
    }

    return creators;
}

int main() {
    const auto start = std::chrono::high_resolution_clock::now();
    const auto creators = makeCreators(50'000);
    const auto result = simulateHybridFanout(creators);
    const auto end = std::chrono::high_resolution_clock::now();
    const auto elapsed =
        std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

    std::cout << "Orbit feed fanout simulation\n";
    std::cout << "Creators: " << creators.size() << "\n";
    std::cout << "Precomputed inbox writes: " << result.precomputedWrites << "\n";
    std::cout << "Read-time celebrity merges: " << result.readTimeMerges << "\n";
    std::cout << "Estimated p95 feed latency: " << result.estimatedP95Ms << "ms\n";
    std::cout << "Simulation runtime: " << elapsed << "ms\n";

    return 0;
}
