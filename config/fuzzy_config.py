"""Centralized configuration for the Fuzzy Logic Stress Classification System.

Course: Essentials of Artificial Intelligence - IT3182
Group: 12 | General Sir John Kotelawala Defence University, Faculty of Computing

All numerical parameters, universe ranges, membership function breakpoints,
and classification thresholds are declared here to ensure a single source of truth.
"""

from typing import Dict, List, Tuple, Any

# ==============================================================================
# 1. UNIVERSE OF DISCOURSE RANGES & CONVENIENCE CONSTANTS
# ==============================================================================

HRV_RANGE: Tuple[float, float] = (20.0, 120.0)
SCREEN_TIME_RANGE: Tuple[float, float] = (0.0, 16.0)
SLEEP_RANGE: Tuple[float, float] = (2.0, 10.0)
STRESS_RANGE: Tuple[float, float] = (0.0, 100.0)

# Linguistic term lists
HRV_TERMS: List[str] = ["low", "normal", "high"]
SCREEN_TERMS: List[str] = ["short", "moderate", "prolonged"]
SLEEP_TERMS: List[str] = ["inadequate", "marginal", "optimal"]
STRESS_TERMS: List[str] = ["low", "medium", "high"]

UNIVERSE_CONFIG: Dict[str, Dict[str, Any]] = {
    "hrv": {
        "min": 20.0,
        "max": 120.0,
        "step": 1.0,
        "unit": "ms",
        "label": "Heart Rate Variability (SDNN/RMSSD)",
        "default": 65.0,
        "range": HRV_RANGE,
    },
    "screen_time": {
        "min": 0.0,
        "max": 16.0,
        "step": 0.5,
        "unit": "hours",
        "label": "Daily Screen Time",
        "default": 6.0,
        "range": SCREEN_TIME_RANGE,
    },
    "sleep_duration": {
        "min": 2.0,
        "max": 10.0,
        "step": 0.5,
        "unit": "hours",
        "label": "Sleep Duration",
        "default": 7.0,
        "range": SLEEP_RANGE,
    },
    "stress_index": {
        "min": 0.0,
        "max": 100.0,
        "step": 1.0,
        "unit": "pts",
        "label": "Stress Index",
        "default": 50.0,
        "range": STRESS_RANGE,
    },
}

# ==============================================================================
# 2. MEMBERSHIP FUNCTION BREAKPOINTS
# ==============================================================================
# Initial engineering assumptions documented per Section 11 of the specification.
# Not presented as medically validated clinical thresholds.
#
# - HRV (Heart Rate Variability):
#   - Low: [20, 20, 35, 50] ms. Depressed autonomic flexibility; indicates fatigue or stress.
#   - Normal: [35, 55, 75] ms. Typical resting baseline for young adults under regular study loads.
#   - High: [60, 80, 120, 120] ms. Robust parasympathetic (vagal) tone; indicates recovery.
#
# - Daily Screen Time:
#   - Short: [0, 0, 2, 5] hours. Minimal digital eye strain; mostly offline activities.
#   - Moderate: [3, 6, 9] hours. Average academic and computer coursework engagement.
#   - Prolonged: [7, 11, 16, 16] hours. Heavy exposure linked to ocular strain and mental fatigue.
#
# - Sleep Duration:
#   - Inadequate: [2, 2, 4, 5.5] hours. Sleep deficit impairing neurocognitive recovery.
#   - Marginal: [4.5, 6, 7.5] hours. Sub-optimal sleep; borderline fatigue.
#   - Optimal: [6.5, 8, 10, 10] hours. Clinically recommended 7-9 hours restorative rest.
#
# - Stress Index Output:
#   - Low: [0, 0, 40]
#   - Medium: [25, 50, 75]
#   - High: [60, 100, 100]

HRV_MF: Dict[str, List[float]] = {
    "low": [20.0, 20.0, 35.0, 50.0],       # Trapezoidal
    "normal": [35.0, 55.0, 75.0],          # Triangular
    "high": [60.0, 80.0, 120.0, 120.0],    # Trapezoidal
}

SCREEN_TIME_MF: Dict[str, List[float]] = {
    "short": [0.0, 0.0, 2.0, 5.0],         # Trapezoidal
    "moderate": [3.0, 6.0, 9.0],           # Triangular
    "prolonged": [7.0, 11.0, 16.0, 16.0],  # Trapezoidal
}

SLEEP_MF: Dict[str, List[float]] = {
    "inadequate": [2.0, 2.0, 4.0, 5.5],    # Trapezoidal
    "marginal": [4.5, 6.0, 7.5],           # Triangular
    "optimal": [6.5, 8.0, 10.0, 10.0],     # Trapezoidal
}

STRESS_MF: Dict[str, List[float]] = {
    "low": [0.0, 0.0, 40.0],               # Triangular
    "medium": [25.0, 50.0, 75.0],          # Triangular
    "high": [60.0, 100.0, 100.0],          # Triangular
}

# ==============================================================================
# 3. CLASSIFICATION THRESHOLDS
# ==============================================================================
# Clean boundaries per Section 10 & 11:
# [0, 40)   -> Low
# [40, 70)  -> Medium
# [70, 100] -> High
STRESS_THRESHOLDS: Dict[str, float] = {
    "medium_min": 40.0,
    "high_min": 70.0,
}

# Linguistic category display labels
STRESS_CATEGORIES: List[str] = ["Low", "Medium", "High"]

# ==============================================================================
# 4. CONTEXTUAL OPTIONS (REFINEMENT LAYER)
# ==============================================================================
AVAILABLE_TIME_OPTIONS: List[str] = [
    "5 minutes",
    "10 minutes",
    "20+ minutes",
]

CONTEXT_OPTIONS: List[str] = [
    "Home",
    "University",
    "Work",
    "Other",
]

# ==============================================================================
# 5. UI METADATA & DISCLAIMERS
# ==============================================================================
APP_METADATA: Dict[str, Any] = {
    "title": "AI-Based Intelligent Solution for Healthcare & Well-being",
    "subtitle": "Fuzzy Logic Stress Classification & Adaptive Coping Recommendation",
    "course": "Essentials of Artificial Intelligence – IT3182",
    "group": "Group 12 | General Sir John Kotelawala Defence University, Faculty of Computing",
    "disclaimer": (
        "This system provides an educational well-being estimate based on the information "
        "entered by the user. It is not a medical diagnosis or substitute for professional healthcare advice."
    ),
}
