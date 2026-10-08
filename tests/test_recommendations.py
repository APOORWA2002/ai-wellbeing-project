"""Unit tests for the Decoupled Recommendation Engine.

Verifies that recommendation selection strictly respects stress category partitioning,
refines choices based on contextual flags, and contains all mandatory Stage 2 actions.
"""

import pytest

from recommendation.recommendation_library import RECOMMENDATION_LIBRARY
from recommendation.recommendation_engine import (
    select_coping_recommendation,
    get_recommendation,
)
from config.fuzzy_config import AVAILABLE_TIME_OPTIONS, CONTEXT_OPTIONS


class TestRecommendationLibrary:
    """Test suite verifying the content and integrity of the recommendation library."""

    def test_mandatory_recommendations_exist(self):
        """Verify that all 8 mandatory recommendations from Stage 2 are present."""
        mandatory_titles = [
            "Active Cardio Break",
            "No Action Needed",
            "Breathing Exercise",
            "Sleep Hygiene Tip",
            "Digital Detox Reminder",
            "Maintain Routine",
            "Short Walk Break",
            "Monitor / Breathing Exercise",
        ]

        library_titles = [rec["title"] for rec in RECOMMENDATION_LIBRARY]
        for title in mandatory_titles:
            assert title in library_titles, f"Mandatory recommendation '{title}' missing from library."

    def test_recommendation_schema(self):
        """Verify that each recommendation entry contains all required schema fields."""
        required_keys = {"id", "title", "description", "stress_category", "duration", "context", "reason"}
        for rec in RECOMMENDATION_LIBRARY:
            for key in required_keys:
                assert key in rec, f"Key '{key}' missing from recommendation {rec.get('id')}"
            assert isinstance(rec["stress_category"], list)
            assert isinstance(rec["context"], list)
            assert len(rec["description"]) > 10


class TestRecommendationEngine:
    """Test suite for recommendation selection and contextual filtering."""

    @pytest.mark.parametrize("category", ["Low", "Medium", "High"])
    def test_valid_recommendation_returned_for_every_category(self, category):
        rec = select_coping_recommendation(category)
        assert rec is not None
        assert category in rec["stress_category"]
        assert "title" in rec
        assert "reason" in rec

    @pytest.mark.parametrize("category", ["Low", "Medium", "High"])
    @pytest.mark.parametrize("duration", AVAILABLE_TIME_OPTIONS)
    @pytest.mark.parametrize("context", CONTEXT_OPTIONS)
    def test_contextual_refinement_matrix(self, category, duration, context):
        """Verify recommendation engine for all combinations of category, duration, and context."""
        rec = select_coping_recommendation(
            stress_category=category,
            available_time=duration,
            context=context,
        )
        assert rec is not None
        # Strict hard constraint: Stress category must never be overridden
        assert category in rec["stress_category"], f"Stress category overridden for {category} / {duration} / {context}"

    def test_time_preference_respected_when_available(self):
        """If 5 minutes is requested for Medium stress, Breathing Exercise should be prioritized."""
        rec_5m = select_coping_recommendation("Medium", available_time="5 minutes", context="Work")
        assert rec_5m["duration"] == "5 minutes"

        rec_10m = select_coping_recommendation("Medium", available_time="10 minutes", context="Work")
        assert rec_10m["duration"] == "10 minutes"

    def test_fallback_on_unrecognized_input(self):
        """Ensure safe fallback when given unrecognized context or category."""
        rec = select_coping_recommendation("Medium", available_time="3 hours", context="Submarine")
        assert rec is not None
        assert "Medium" in rec["stress_category"]
