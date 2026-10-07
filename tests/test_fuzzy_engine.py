"""Unit and integration tests for the Fuzzy Logic Engine.

Verifies:
- Membership functions (individual degrees in [0,1], coverage, no invalid sum tests)
- Complete 27-core-rule Cartesian coverage using itertools.product
- Supplementary rule preservation (R4-R7, exactly 31 total rules)
- Mamdani inference and centroid defuzzification
- Canonical scenarios (Low: 100/2/9, High: 30/14/3, Med: 65/7/6)
- Exact boundary tests (39.999 -> Low, 40.0 -> Medium, 69.999 -> Medium, 70.0 -> High)
"""

import itertools
import pytest
import numpy as np

from config.fuzzy_config import (
    UNIVERSE_CONFIG,
    HRV_RANGE,
    SCREEN_TIME_RANGE,
    SLEEP_RANGE,
    STRESS_RANGE,
    HRV_TERMS,
    SCREEN_TERMS,
    SLEEP_TERMS,
    STRESS_TERMS,
    STRESS_THRESHOLDS,
)
from fuzzy_engine.membership import (
    create_fuzzy_universes,
    build_fuzzy_variables,
    compute_memberships,
)
from fuzzy_engine.rules import (
    CORE_RULES_DATA,
    SUPPLEMENTARY_RULES_DATA,
    ALL_RULES_DATA,
    build_skfuzzy_rules,
    validate_core_rule_coverage,
)
from fuzzy_engine.inference import run_fuzzy_inference, get_fuzzy_engine
from fuzzy_engine.classifier import classify_stress


class TestMembershipFunctions:
    """Test suite for membership function generation and mathematical properties."""

    def test_universes_defined_correctly(self):
        universes = create_fuzzy_universes()
        assert "hrv" in universes
        assert "screen_time" in universes
        assert "sleep_duration" in universes
        assert "stress_index" in universes

        assert universes["hrv"][0] == HRV_RANGE[0]
        assert universes["hrv"][-1] == HRV_RANGE[1]
        assert universes["screen_time"][0] == SCREEN_TIME_RANGE[0]
        assert universes["screen_time"][-1] == SCREEN_TIME_RANGE[1]
        assert universes["sleep_duration"][0] == SLEEP_RANGE[0]
        assert universes["sleep_duration"][-1] == SLEEP_RANGE[1]
        assert universes["stress_index"][0] == STRESS_RANGE[0]
        assert universes["stress_index"][-1] == STRESS_RANGE[1]

    def test_membership_degrees_bounded_zero_one(self):
        """Verify that every individual membership value is strictly within [0.0, 1.0].

        Note per Section 46: Do NOT test sum(memberships) == 1 or <= 1, as overlapping
        fuzzy sets can have arbitrary sums.
        """
        test_inputs = [
            (20.0, 0.0, 2.0),
            (120.0, 16.0, 10.0),
            (65.0, 8.0, 7.0),
            (42.0, 9.5, 5.2),
            (35.0, 3.0, 4.5),
            (75.0, 9.0, 7.5),
            (55.0, 6.0, 6.0),
        ]
        for hrv, sc, sl in test_inputs:
            m = compute_memberships(hrv, sc, sl)
            for var_name, terms in m.items():
                for term_name, deg in terms.items():
                    assert 0.0 <= deg <= 1.0, f"{var_name}.{term_name} had invalid degree {deg}"

    def test_full_range_coverage_nonzero_memberships(self):
        """Ensure that every valid point has non-zero membership in at least one set per variable."""
        for hrv in np.linspace(HRV_RANGE[0], HRV_RANGE[1], 21):
            for sc in np.linspace(SCREEN_TIME_RANGE[0], SCREEN_TIME_RANGE[1], 9):
                for sl in np.linspace(SLEEP_RANGE[0], SLEEP_RANGE[1], 9):
                    m = compute_memberships(hrv, sc, sl)
                    assert any(v > 0.0 for v in m["hrv"].values()), f"HRV {hrv} has no active set"
                    assert any(v > 0.0 for v in m["screen_time"].values()), f"Screen {sc} has no active set"
                    assert any(v > 0.0 for v in m["sleep_duration"].values()), f"Sleep {sl} has no active set"


class TestCoreRuleCoverage:
    """Test suite programmatically verifying the 27 core combinations (Section 42)."""

    def test_core_rule_cartesian_coverage(self):
        """Verify the 27 core rules cover itertools.product(HRV_TERMS, SCREEN_TERMS, SLEEP_TERMS) exactly once."""
        expected_combinations = set(itertools.product(HRV_TERMS, SCREEN_TERMS, SLEEP_TERMS))
        assert len(expected_combinations) == 27, "Cartesian product must contain exactly 27 combinations."

        core_combinations = []
        for rule in CORE_RULES_DATA:
            ant = rule["antecedent"]
            # Validate linguistic terms
            assert ant["hrv"] in HRV_TERMS, f"Invalid HRV term {ant['hrv']} in rule {rule['id']}"
            assert ant["screen_time"] in SCREEN_TERMS, f"Invalid screen term {ant['screen_time']} in rule {rule['id']}"
            assert ant["sleep_duration"] in SLEEP_TERMS, f"Invalid sleep term {ant['sleep_duration']} in rule {rule['id']}"
            assert rule["consequent"].lower() in STRESS_TERMS, f"Invalid consequent in rule {rule['id']}"

            combo = (ant["hrv"], ant["screen_time"], ant["sleep_duration"])
            core_combinations.append(combo)

        # Check total core count
        assert len(core_combinations) == 27, f"Expected 27 core rules, got {len(core_combinations)}"

        # Check no duplicates
        assert len(set(core_combinations)) == 27, "Found duplicate core combinations."

        # Check no missing combinations
        missing = expected_combinations - set(core_combinations)
        assert len(missing) == 0, f"Missing core combinations: {missing}"

    def test_validation_function(self):
        """Verify the programmatic validate_core_rule_coverage() utility returns valid."""
        report = validate_core_rule_coverage()
        assert report["is_valid"] is True
        assert report["expected_count"] == 27
        assert report["core_count"] == 27
        assert report["unique_count"] == 27
        assert len(report["missing_combinations"]) == 0
        assert len(report["duplicate_combinations"]) == 0

    def test_supplementary_rules_isolated(self):
        """Verify exactly 4 supplementary rules exist and do not count toward the 27 core rules."""
        assert len(SUPPLEMENTARY_RULES_DATA) == 4
        supp_ids = {r["id"] for r in SUPPLEMENTARY_RULES_DATA}
        assert supp_ids == {"R4", "R5", "R6", "R7"}
        assert len(ALL_RULES_DATA) == 31

    def test_documented_rules_preserved(self):
        """Verify that R1, R2, R3, R4, R5, R6, R7, R8 are all preserved with documentary metadata."""
        documented_report_ids = {"R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"}
        found_report_ids = set()

        for r in ALL_RULES_DATA:
            if r.get("report_id"):
                found_report_ids.add(r["report_id"])

        assert documented_report_ids.issubset(found_report_ids)

    def test_rules_compile_in_scikit_fuzzy(self):
        """Verify that all 31 rules compile into valid scikit-fuzzy ctrl.Rule objects."""
        hrv, screen_time, sleep_duration, stress_index = build_fuzzy_variables()
        sk_rules = build_skfuzzy_rules(hrv, screen_time, sleep_duration, stress_index)
        assert len(sk_rules) == 31


class TestFuzzyInferenceEngine:
    """Test suite for end-to-end Mamdani inference and centroid defuzzification."""

    @pytest.fixture(scope="class")
    def engine(self):
        return get_fuzzy_engine()

    def test_required_canonical_test_cases(self):
        """Verify the 3 mandatory test cases specified in Section 44 of the prompt."""
        # 1. Low Stress: HRV 100 ms, Screen Time 2 h, Sleep 9 h -> Low
        res_low = run_fuzzy_inference(100.0, 2.0, 9.0)
        assert isinstance(res_low.crisp_stress_index, float)
        assert 0.0 <= res_low.crisp_stress_index <= 100.0
        cat_low = classify_stress(res_low.crisp_stress_index)
        assert cat_low == "Low", f"Expected Low, got {cat_low} ({res_low.crisp_stress_index})"
        assert res_low.crisp_stress_index < 40.0

        # 2. High Stress: HRV 30 ms, Screen Time 14 h, Sleep 3 h -> High
        res_high = run_fuzzy_inference(30.0, 14.0, 3.0)
        assert isinstance(res_high.crisp_stress_index, float)
        assert 0.0 <= res_high.crisp_stress_index <= 100.0
        cat_high = classify_stress(res_high.crisp_stress_index)
        assert cat_high == "High", f"Expected High, got {cat_high} ({res_high.crisp_stress_index})"
        assert res_high.crisp_stress_index >= 70.0

        # 3. Medium Stress: HRV 65 ms, Screen Time 7 h, Sleep 6 h -> Medium
        res_med = run_fuzzy_inference(65.0, 7.0, 6.0)
        assert isinstance(res_med.crisp_stress_index, float)
        assert 0.0 <= res_med.crisp_stress_index <= 100.0
        cat_med = classify_stress(res_med.crisp_stress_index)
        assert cat_med == "Medium", f"Expected Medium, got {cat_med} ({res_med.crisp_stress_index})"
        assert 40.0 <= res_med.crisp_stress_index < 70.0

    def test_all_boundary_corners_no_crash(self):
        """Test all 8 boundary corners: HRV in {20, 120}, Screen in {0, 16}, Sleep in {2, 10}."""
        boundaries = [
            (20.0, 0.0, 2.0),
            (20.0, 0.0, 10.0),
            (20.0, 16.0, 2.0),
            (20.0, 16.0, 10.0),
            (120.0, 0.0, 2.0),
            (120.0, 0.0, 10.0),
            (120.0, 16.0, 2.0),
            (120.0, 16.0, 10.0),
        ]
        for hrv, sc, sl in boundaries:
            res = run_fuzzy_inference(hrv, sc, sl)
            assert isinstance(res.crisp_stress_index, float)
            assert 0.0 <= res.crisp_stress_index <= 100.0
            cat = classify_stress(res.crisp_stress_index)
            assert cat in {"Low", "Medium", "High"}
            assert len(res.active_rules) > 0, f"No rules fired at boundary ({hrv}, {sc}, {sl})"

    def test_firing_strengths_bounded(self):
        """Verify that every firing strength is strictly between 0.0 and 1.0."""
        res = run_fuzzy_inference(45.0, 8.0, 5.0)
        for r in res.rule_evaluations:
            assert 0.0 <= r.firing_strength <= 1.0


class TestStressClassifier:
    """Test suite for the deterministic classifier mapping per Section 45 & 48."""

    @pytest.mark.parametrize("value,expected", [
        (0.0, "Low"),
        (20.0, "Low"),
        (39.999, "Low"),
        (40.0, "Medium"),
        (50.0, "Medium"),
        (69.999, "Medium"),
        (70.0, "High"),
        (85.0, "High"),
        (100.0, "High"),
    ])
    def test_classification_thresholds_exact(self, value, expected):
        """Verify the clean [0, 40), [40, 70), [70, 100] decision thresholds."""
        assert classify_stress(value) == expected

    def test_classifier_raises_for_out_of_bounds(self):
        """Classifier must validate that input is within [0, 100] per Section 24."""
        with pytest.raises(ValueError):
            classify_stress(-0.01)
        with pytest.raises(ValueError):
            classify_stress(100.01)
