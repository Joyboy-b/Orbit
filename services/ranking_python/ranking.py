from pathlib import Path
import importlib.util
import sys

_source = Path(__file__).resolve().parents[1] / "ranking-python" / "ranking.py"
_spec = importlib.util.spec_from_file_location("Orbit_ranking", _source)
if _spec is None or _spec.loader is None:
    raise ImportError("Unable to load ranking-python/ranking.py")

_module = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = _module
_spec.loader.exec_module(_module)

CandidatePost = _module.CandidatePost
RankedPost = _module.RankedPost
score_post = _module.score_post
rank_feed = _module.rank_feed
