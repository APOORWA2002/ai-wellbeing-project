"""Unit tests for Input Validation and Explanation Generation.

Verifies range checks, boundary rejection, and the structured transparency payload.
"""

import pytest

from ui.dashboard import validate_inputs
from fuzzy_engine.inference import run_fuzzy_inference
from fuzzy_engine.classifier import classify_stress
from recommendation.recommendation_engine import select_coping_recommendation
from explanation.explanation_engine import generate_explanation, identify_stress_drivers


class TestInputValidation:
    """Test suite for preprocessing and validation layer (Stage 2)."""

    def test_valid_inputs_pass(self):
        assert validate_inputs(65.0, 6.0, 7.0) is None
        assert validate_inputs(20.0, 0.0, 2.0) is None
        assert validate_inputs(120.0, 16.0, 10.0) is None

    def test_hrv_out_of_bounds(self):
        err_low = validate_inputs(19.0, 6.0, 7.0)
        assert err_low is not None
        assert "HRV" in err_low

        err_high = validate_inputs(125.0, 6.0, 7.0)
        assert err_high is not None
        assert "HRV" in err_high

    def test_screen_time_out_of_bounds(self):
        err_neg = validate_inputs(60.0, -1.0, 7.0)
        assert err_neg is not None
        assert "Screen Time" in err_neg

        err_excess = validate_inputs(60.0, 18.0, 7.0)
        assert err_excess is not None
        assert "Screen Time" in err_excess

    def test_sleep_duration_out_of_bounds(self):
        err_low = validate_inputs(60.0, 6.0, 1.5)
        assert err_low is not None
        assert "Sleep Duration" in err_low

        err_high = validate_inputs(60.0, 6.0, 11.0)
        assert err_high is not None
        assert "Sleep Duration" in err_high


class TestExplanationEngine:
    """Test suite for transparency and explanation generation (Stage 6)."""

    def test_explanation_contains_all_required_keys(self):
        inference = run_fuzzy_inference(42.0, 9.5, 5.2)
        category = classify_stress(inference.crisp_stress_index)
        rec = select_coping_recommendation(category)
        explanation = generate_explanation(inference, category, rec)

        required_keys = {
            "crisp_stress_index",
            "stress_category",
            "inputs",
            "memberships",
            "active_rules",
            "stress_drivers",
            "recommendation",
            "formatted_text",
        }
        for key in required_keys:
            assert key in explanation, f"Missing key '{key}' in explanation output"

    def test_explanation_reflects_actual_inputs(self):
        inference = run_fuzzy_inference(42.0, 9.5, 5.2)
        category = classify_stress(inference.crisp_stress_index)
        rec = select_coping_recommendation(category)
        explanation = generate_explanation(inference, category, rec)

        # Check that actual values appear in the formatted text output
        text = explanation["formatted_text"]
        assert "42 ms" in text
        assert "9.5h" in text
        assert "5.2h" in text
        assert "Stress Index:" in text
        assert "Active Rules:" in text
        assert "Recommendation:" in text

    def test_stress_drivers_identification(self):
        memberships_stressful = {
            "hrv": {"low": 0.8, "normal": 0.2, "high": 0.0},
            "screen_time": {"short": 0.0, "moderate": 0.2, "prolonged": 0.8},
            "sleep_duration": {"inadequate": 0.7, "marginal": 0.3, "optimal": 0.0},
        }
        drivers = identify_stress_drivers(memberships_stressful)
        assert len(drivers) >= 3
        assert any("Heart Rate Variability" in d for d in drivers)
        assert any("Screen Time" in d for d in drivers)
        assert any("Sleep" in d for d in drivers)
