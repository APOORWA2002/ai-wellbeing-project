"""Rule-based recommendation engine package for adaptive coping selection."""

from recommendation.recommendation_engine import get_recommendation
from recommendation.recommendation_library import RECOMMENDATION_LIBRARY

__all__ = [
    "get_recommendation",
    "RECOMMENDATION_LIBRARY",
]
