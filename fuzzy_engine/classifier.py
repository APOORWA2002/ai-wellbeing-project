"""Stress classification module mapping defuzzified crisp index to linguistic categories.

Maps the continuous Stress Index (0-100) to exactly one user-facing category:
Low, Medium, or High, using the clean, non-overlapping thresholds configured in fuzzy_config.py:
[0, 40)   -> Low
[40, 70)  -> Medium
[70, 100] -> High
"""

from typing import Dict
from config.fuzzy_config import STRESS_THRESHOLDS, STRESS_RANGE


def classify_stress(stress_index: float) -> str:
    """Map a continuous defuzzified Stress Index (0-100) to a linguistic category.

    Strictly implements:
        if stress_index < 40.0:
            category = "Low"
        elif stress_index < 70.0:
            category = "Medium"
        else:
            category = "High"

    Args:
        stress_index: Centroid defuzzified crisp stress score in [0, 100].

    Returns:
        str: Exactly one of "Low", "Medium", or "High".

    Raises:
        ValueError: If stress_index is outside the valid range [0, 100].
    """
    if stress_index < STRESS_RANGE[0] or stress_index > STRESS_RANGE[1]:
        raise ValueError(
            f"Stress index {stress_index} is outside the valid range [{STRESS_RANGE[0]}, {STRESS_RANGE[1]}]."
        )

    medium_min = STRESS_THRESHOLDS.get("medium_min", 40.0)
    high_min = STRESS_THRESHOLDS.get("high_min", 70.0)

    if stress_index < medium_min:
        return "Low"
    elif stress_index < high_min:
        return "Medium"
    else:
        return "High"


def get_category_color(category: str) -> str:
    """Return a UI theme hex color associated with the stress category."""
    color_map: Dict[str, str] = {
        "Low": "#28a745",     # Emerald Green
        "Medium": "#ffc107",  # Warm Amber
        "High": "#dc3545",    # Crimson Red
    }
    return color_map.get(category, "#6c757d")


def get_category_badge_info(category: str) -> Dict[str, str]:
    """Return badge styling and description for the stress category."""
    badge_info = {
        "Low": {
            "label": "LOW STRESS",
            "color": "#198754",
            "bg_color": "#d1e7dd",
            "description": "Optimal physiological balance and restorative state. Autonomic tone is resilient.",
        },
        "Medium": {
            "label": "MEDIUM STRESS",
            "color": "#997404",
            "bg_color": "#fff3cd",
            "description": "Moderate physiological load or digital fatigue. Proactive micro-breaks recommended.",
        },
        "High": {
            "label": "HIGH STRESS",
            "color": "#842029",
            "bg_color": "#f8d7da",
            "description": "Significant autonomic strain or cumulative exhaustion. Immediate coping action advised.",
        },
    }
    return badge_info.get(category, {
        "label": "UNKNOWN",
        "color": "#6c757d",
        "bg_color": "#e2e3e5",
        "description": "Unclassified state.",
    })
