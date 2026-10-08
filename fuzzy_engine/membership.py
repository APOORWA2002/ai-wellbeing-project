"""Membership function definitions and evaluation for the Fuzzy Logic Engine.

Defines Antecedents and Consequents using scikit-fuzzy, utilizing trapezoidal
and triangular membership functions according to the Stage 2 report specification.
"""

from typing import Dict, Tuple
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

from config.fuzzy_config import (
    UNIVERSE_CONFIG,
    HRV_MF,
    SCREEN_TIME_MF,
    SLEEP_MF,
    STRESS_MF,
)


def create_fuzzy_universes() -> Dict[str, np.ndarray]:
    """Generate numpy arrays for the universes of discourse."""
    # Ensure float precision and range coverage
    hrv_cfg = UNIVERSE_CONFIG["hrv"]
    screen_cfg = UNIVERSE_CONFIG["screen_time"]
    sleep_cfg = UNIVERSE_CONFIG["sleep_duration"]
    stress_cfg = UNIVERSE_CONFIG["stress_index"]

    return {
        "hrv": np.arange(hrv_cfg["min"], hrv_cfg["max"] + 0.1, hrv_cfg["step"], dtype=np.float64),
        "screen_time": np.arange(screen_cfg["min"], screen_cfg["max"] + 0.05, screen_cfg["step"], dtype=np.float64),
        "sleep_duration": np.arange(sleep_cfg["min"], sleep_cfg["max"] + 0.05, sleep_cfg["step"], dtype=np.float64),
        "stress_index": np.arange(stress_cfg["min"], stress_cfg["max"] + 0.1, stress_cfg["step"], dtype=np.float64),
    }


def build_fuzzy_variables() -> Tuple[ctrl.Antecedent, ctrl.Antecedent, ctrl.Antecedent, ctrl.Consequent]:
    """Instantiate scikit-fuzzy Antecedents and Consequent with configured MFs.

    Returns:
        Tuple[ctrl.Antecedent, ctrl.Antecedent, ctrl.Antecedent, ctrl.Consequent]:
            (hrv, screen_time, sleep_duration, stress_index)
    """
    universes = create_fuzzy_universes()

    # 1. Antecedent: Heart Rate Variability (HRV) [20 - 120 ms]
    hrv = ctrl.Antecedent(universes["hrv"], "hrv")
    hrv["low"] = fuzz.trapmf(hrv.universe, HRV_MF["low"])
    hrv["normal"] = fuzz.trimf(hrv.universe, HRV_MF["normal"])
    hrv["high"] = fuzz.trapmf(hrv.universe, HRV_MF["high"])

    # 2. Antecedent: Daily Screen Time [0 - 16 hours]
    screen_time = ctrl.Antecedent(universes["screen_time"], "screen_time")
    screen_time["short"] = fuzz.trapmf(screen_time.universe, SCREEN_TIME_MF["short"])
    screen_time["moderate"] = fuzz.trimf(screen_time.universe, SCREEN_TIME_MF["moderate"])
    screen_time["prolonged"] = fuzz.trapmf(screen_time.universe, SCREEN_TIME_MF["prolonged"])

    # 3. Antecedent: Sleep Duration [2 - 10 hours]
    sleep_duration = ctrl.Antecedent(universes["sleep_duration"], "sleep_duration")
    sleep_duration["inadequate"] = fuzz.trapmf(sleep_duration.universe, SLEEP_MF["inadequate"])
    sleep_duration["marginal"] = fuzz.trimf(sleep_duration.universe, SLEEP_MF["marginal"])
    sleep_duration["optimal"] = fuzz.trapmf(sleep_duration.universe, SLEEP_MF["optimal"])

    # 4. Consequent: Stress Index [0 - 100]
    stress_index = ctrl.Consequent(universes["stress_index"], "stress_index", defuzzify_method="centroid")
    stress_index["low"] = fuzz.trimf(stress_index.universe, STRESS_MF["low"])
    stress_index["medium"] = fuzz.trimf(stress_index.universe, STRESS_MF["medium"])
    stress_index["high"] = fuzz.trimf(stress_index.universe, STRESS_MF["high"])

    return hrv, screen_time, sleep_duration, stress_index


def compute_memberships(
    hrv_val: float, screen_time_val: float, sleep_duration_val: float
) -> Dict[str, Dict[str, float]]:
    """Calculate exact membership degrees for each linguistic term across all inputs.

    Args:
        hrv_val: Crisp Heart Rate Variability in ms [20, 120]
        screen_time_val: Crisp Daily Screen Time in hours [0, 16]
        sleep_duration_val: Crisp Sleep Duration in hours [2, 10]

    Returns:
        Dict[str, Dict[str, float]]: Dictionary mapping variable name to its term membership degrees.
    """
    universes = create_fuzzy_universes()

    # Calculate degrees using fuzz.interp_membership
    hrv_u = universes["hrv"]
    screen_u = universes["screen_time"]
    sleep_u = universes["sleep_duration"]

    memberships: Dict[str, Dict[str, float]] = {
        "hrv": {
            "low": float(fuzz.interp_membership(hrv_u, fuzz.trapmf(hrv_u, HRV_MF["low"]), hrv_val)),
            "normal": float(fuzz.interp_membership(hrv_u, fuzz.trimf(hrv_u, HRV_MF["normal"]), hrv_val)),
            "high": float(fuzz.interp_membership(hrv_u, fuzz.trapmf(hrv_u, HRV_MF["high"]), hrv_val)),
        },
        "screen_time": {
            "short": float(fuzz.interp_membership(screen_u, fuzz.trapmf(screen_u, SCREEN_TIME_MF["short"]), screen_time_val)),
            "moderate": float(fuzz.interp_membership(screen_u, fuzz.trimf(screen_u, SCREEN_TIME_MF["moderate"]), screen_time_val)),
            "prolonged": float(fuzz.interp_membership(screen_u, fuzz.trapmf(screen_u, SCREEN_TIME_MF["prolonged"]), screen_time_val)),
        },
        "sleep_duration": {
            "inadequate": float(fuzz.interp_membership(sleep_u, fuzz.trapmf(sleep_u, SLEEP_MF["inadequate"]), sleep_duration_val)),
            "marginal": float(fuzz.interp_membership(sleep_u, fuzz.trimf(sleep_u, SLEEP_MF["marginal"]), sleep_duration_val)),
            "optimal": float(fuzz.interp_membership(sleep_u, fuzz.trapmf(sleep_u, SLEEP_MF["optimal"]), sleep_duration_val)),
        },
    }

    # Clean small floating point errors e.g. -0.0 -> 0.0, and clip strictly to [0.0, 1.0]
    for var, terms in memberships.items():
        for term, deg in terms.items():
            deg = round(deg, 4)
            if deg < 0.0:
                deg = 0.0
            elif deg > 1.0:
                deg = 1.0
            memberships[var][term] = deg

    return memberships
