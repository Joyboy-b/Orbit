from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from math import log10, sqrt


@dataclass(frozen=True)
class CandidatePost:
    post_id: str
    author_affinity: float
    created_at: datetime
    reactions: int
    comments: int
    reposts: int
    saves: int
    has_media: bool
    same_community: bool


@dataclass(frozen=True)
class RankedPost:
    post_id: str
    score: float
    explanation: tuple[str, ...]


def score_post(
    post: CandidatePost,
    now: datetime | None = None,
) -> RankedPost:
    now = now or datetime.now(timezone.utc)
    age_hours = max(1.0, (now - post.created_at).total_seconds() / 3600)
    recency = 45 / sqrt(age_hours)
    affinity = post.author_affinity * 38
    engagement = (
        log10(post.reactions + 1) * 12
        + log10(post.comments + 1) * 9
        + log10(post.reposts + 1) * 8
        + log10(post.saves + 1) * 7
    )
    media_boost = 8 if post.has_media else 0
    community_boost = 6 if post.same_community else 0
    score = recency + affinity + engagement + media_boost + community_boost

    return RankedPost(
        post_id=post.post_id,
        score=score,
        explanation=(
            f"recency={recency:.2f}",
            f"affinity={affinity:.2f}",
            f"engagement={engagement:.2f}",
            f"media={media_boost:.2f}",
            f"community={community_boost:.2f}",
        ),
    )


def rank_feed(
    candidates: list[CandidatePost],
    now: datetime | None = None,
) -> list[RankedPost]:
    return sorted(
        (score_post(candidate, now) for candidate in candidates),
        key=lambda post: post.score,
        reverse=True,
    )
