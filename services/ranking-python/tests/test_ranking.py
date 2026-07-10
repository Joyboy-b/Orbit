from datetime import datetime, timedelta, timezone
import unittest

from services.ranking_python.ranking import CandidatePost, rank_feed, score_post


class RankingTests(unittest.TestCase):
    def test_recent_high_affinity_media_post_scores_well(self) -> None:
        now = datetime(2026, 7, 9, 14, tzinfo=timezone.utc)
        post = CandidatePost(
            post_id="p-1",
            author_affinity=0.9,
            created_at=now - timedelta(hours=2),
            reactions=100,
            comments=20,
            reposts=10,
            saves=15,
            has_media=True,
            same_community=True,
        )

        ranked = score_post(post, now)

        self.assertGreater(ranked.score, 100)
        self.assertIn("media=8.00", ranked.explanation)

    def test_feed_is_sorted_by_score_descending(self) -> None:
        now = datetime(2026, 7, 9, 14, tzinfo=timezone.utc)
        candidates = [
            CandidatePost("old", 0.2, now - timedelta(days=4), 4, 1, 0, 0, False, False),
            CandidatePost("strong", 0.9, now - timedelta(hours=1), 200, 40, 8, 15, True, True),
        ]

        ranked = rank_feed(candidates, now)

        self.assertEqual(ranked[0].post_id, "strong")


if __name__ == "__main__":
    unittest.main()
