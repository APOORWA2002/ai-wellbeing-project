"""Mamdani Fuzzy Inference System and Defuzzification Engine.

Executes the fuzzification, rule evaluation (min/AND operator), aggregation (max/OR operator),
and centroid defuzzification to generate the crisp Stress Index (0-100).
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

from config.fuzzy_config import UNIVERSE_CONFIG, STRESS_MF
from fuzzy_engine.membership import build_fuzzy_variables, compute_memberships, create_fuzzy_universes
from fuzzy_engine.rules import build_skfuzzy_rules, ALL_RULES_DATA


@dataclass
class RuleFiring:
    """Represents an evaluated rule and its activation degree."""
    rule_id: str
    doc_id: str
    rule_type: str
    condition_text: str
    consequent: str
    firing_strength: float
    recommendation_hint: str
    rationale: str
    is_active: bool


@dataclass
class InferenceResult:
    """Encapsulates the complete result of a fuzzy inference pass."""
    inputs: Dict[str, float]
    memberships: Dict[str, Dict[str, float]]
    crisp_stress_index: float
    rule_evaluations: List[RuleFiring] = field(default_factory=list)
    active_rules: List[RuleFiring] = field(default_factory=list)
    aggregated_fuzzy_set: np.ndarray = field(default_factory=lambda: np.zeros(101))
    stress_universe: np.ndarray = field(default_factory=lambda: np.arange(0, 101, 1, dtype=np.float64))


class FuzzyInferenceEngine:
    """Manages the lifecycle of the Mamdani Fuzzy Control System."""

    def __init__(self) -> None:
        """Initialize fuzzy control system with variables and all 31 rules."""
        self.hrv, self.screen_time, self.sleep_duration, self.stress_index = build_fuzzy_variables()
        self.rules = build_skfuzzy_rules(
            self.hrv, self.screen_time, self.sleep_duration, self.stress_index
        )
        self.control_system = ctrl.ControlSystem(self.rules)
        self.simulation = ctrl.ControlSystemSimulation(self.control_system)
        self.universes = create_fuzzy_universes()

    def evaluate_rules(self, memberships: Dict[str, Dict[str, float]]) -> List[RuleFiring]:
        """Compute individual rule firing strengths using the Mamdani MIN operator.

        Args:
            memberships: Term membership degrees per variable.

        Returns:
            List[RuleFiring]: Detailed firing status for all rules.
        """
        rule_firings: List[RuleFiring] = []

        for r_meta in ALL_RULES_DATA:
            antecedents = r_meta["antecedent"]
            consequent = r_meta["consequent"]

            # Calculate rule firing strength: alpha = min(antecedent_memberships)
            degrees = []
            clause_strs = []
            for var_name, term_label in antecedents.items():
                deg = memberships[var_name][term_label]
                degrees.append(deg)
                clause_strs.append(f"{var_name.replace('_', ' ').title()}={term_label.title()}")

            alpha = float(min(degrees)) if degrees else 0.0
            condition_text = " AND ".join(clause_strs)
            is_active = alpha > 0.0001

            doc_label = r_meta.get("report_id") or r_meta.get("doc_id") or r_meta["id"]
            firing = RuleFiring(
                rule_id=r_meta["id"],
                doc_id=doc_label,
                rule_type=r_meta["type"],
                condition_text=condition_text,
                consequent=consequent.title(),
                firing_strength=round(alpha, 4),
                recommendation_hint=r_meta["recommendation_hint"],
                rationale=r_meta["rationale"],
                is_active=is_active,
            )
            rule_firings.append(firing)

        return rule_firings

    def compute_aggregated_output(self, rule_firings: List[RuleFiring]) -> np.ndarray:
        """Compute the aggregated consequent fuzzy set across all fired rules.

        Mamdani implication: truncated consequent = min(alpha, mf(z))
        Aggregation: max across all rules for each point z in universe.

        Args:
            rule_firings: List of evaluated rule firings.

        Returns:
            np.ndarray: Aggregated membership degrees over the stress universe.
        """
        stress_u = self.universes["stress_index"]
        low_mf = fuzz.trimf(stress_u, STRESS_MF["low"])
        med_mf = fuzz.trimf(stress_u, STRESS_MF["medium"])
        high_mf = fuzz.trimf(stress_u, STRESS_MF["high"])

        mf_lookup = {
            "Low": low_mf,
            "Medium": med_mf,
            "High": high_mf,
        }

        aggregated = np.zeros_like(stress_u)

        for firing in rule_firings:
            if firing.firing_strength > 0.0001:
                target_mf = mf_lookup[firing.consequent]
                # Implication: min(alpha, consequent_mf)
                clipped = np.fmin(firing.firing_strength, target_mf)
                # Aggregation: max(aggregated, clipped)
                aggregated = np.fmax(aggregated, clipped)

        return aggregated

    def compute(
        self, hrv_val: float, screen_time_val: float, sleep_duration_val: float
    ) -> InferenceResult:
        """Execute full fuzzy inference pipeline for given crisp inputs.

        Args:
            hrv_val: Heart Rate Variability (ms)
            screen_time_val: Daily Screen Time (hours)
            sleep_duration_val: Sleep Duration (hours)

        Returns:
            InferenceResult: Complete inference telemetry and defuzzified stress index.
        """
        # Clamp inputs to valid universe ranges to prevent out-of-bounds simulation crash
        hrv_clamped = float(np.clip(hrv_val, UNIVERSE_CONFIG["hrv"]["min"], UNIVERSE_CONFIG["hrv"]["max"]))
        screen_clamped = float(np.clip(screen_time_val, UNIVERSE_CONFIG["screen_time"]["min"], UNIVERSE_CONFIG["screen_time"]["max"]))
        sleep_clamped = float(np.clip(sleep_duration_val, UNIVERSE_CONFIG["sleep_duration"]["min"], UNIVERSE_CONFIG["sleep_duration"]["max"]))

        # 1. Fuzzification: Calculate membership degrees for inputs
        memberships = compute_memberships(hrv_clamped, screen_clamped, sleep_clamped)

        # 2. Rule Evaluation: Evaluate firing strength for all 31 rules
        rule_evaluations = self.evaluate_rules(memberships)
        active_rules = [r for r in rule_evaluations if r.is_active]
        # Sort active rules by firing strength descending
        active_rules.sort(key=lambda r: r.firing_strength, reverse=True)

        # 3. Aggregation & Defuzzification:
        # Run through scikit-fuzzy control simulation
        try:
            self.simulation.input["hrv"] = hrv_clamped
            self.simulation.input["screen_time"] = screen_clamped
            self.simulation.input["sleep_duration"] = sleep_clamped
            self.simulation.compute()
            crisp_stress = float(self.simulation.output["stress_index"])
        except Exception:
            # Mathematical fallback: defuzzify manually via centroid on aggregated set
            aggregated_set = self.compute_aggregated_output(rule_evaluations)
            stress_u = self.universes["stress_index"]
            if np.sum(aggregated_set) > 1e-6:
                crisp_stress = float(fuzz.defuzz(stress_u, aggregated_set, "centroid"))
            else:
                crisp_stress = 50.0  # Safe midpoint default

        # Clamp crisp stress to [0.0, 100.0]
        crisp_stress = float(np.clip(crisp_stress, 0.0, 100.0))

        # Compute aggregated fuzzy set for visualization
        aggregated_set = self.compute_aggregated_output(rule_evaluations)

        return InferenceResult(
            inputs={
                "hrv": hrv_val,
                "screen_time": screen_time_val,
                "sleep_duration": sleep_duration_val,
            },
            memberships=memberships,
            crisp_stress_index=round(crisp_stress, 2),
            rule_evaluations=rule_evaluations,
            active_rules=active_rules,
            aggregated_fuzzy_set=aggregated_set,
            stress_universe=self.universes["stress_index"],
        )


# Singleton instance for high-performance reuse
_ENGINE_INSTANCE = None


def get_fuzzy_engine() -> FuzzyInferenceEngine:
    """Retrieve or create the global FuzzyInferenceEngine singleton."""
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        _ENGINE_INSTANCE = FuzzyInferenceEngine()
    return _ENGINE_INSTANCE


def run_fuzzy_inference(
    hrv_val: float, screen_time_val: float, sleep_duration_val: float
) -> InferenceResult:
    """Convenience function to run fuzzy inference on inputs."""
    engine = get_fuzzy_engine()
    return engine.compute(hrv_val, screen_time_val, sleep_duration_val)
