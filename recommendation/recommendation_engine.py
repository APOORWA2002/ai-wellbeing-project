"""Rule-Based Recommendation Engine for Adaptive Coping Interventions.

Decoupled from the fuzzy engine. Receives the linguistic stress category
and optional contextual flags (time available, physical setting) to select
the most clinically and contextually appropriate coping action.
"""

from typing import Dict, Optional, Any, List
from recommendation.recommendation_library import RECOMMENDATION_LIBRARY


def select_coping_recommendation(
    stress_category: str,
    available_time: Optional[str] = None,
    context: Optional[str] = None,
    stressor_hint: Optional[str] = None,
) -> Dict[str, Any]:
    """Select the best matching coping action from the library based on category and context.

    Hard constraint: The stress category strictly partitions the eligible actions.
    Contextual flags (time and environment) only choose BETWEEN options within the category,
    never overriding the stress category itself.

    Args:
        stress_category: Linguistic stress category ("Low", "Medium", or "High").
        available_time: Available duration ("5 minutes", "10 minutes", "20+ minutes").
        context: User environment ("Home", "University", "Work", "Other").
        stressor_hint: Optional hint about dominant stress driver ("sleep", "screen", "cardio", etc.).

    Returns:
        Dict[str, Any]: Selected recommendation dictionary.
    """
    # 1. Strict primary filter by stress category
    category_candidates: List[Dict[str, Any]] = [
        rec for rec in RECOMMENDATION_LIBRARY
        if stress_category in rec["stress_category"]
    ]

    # Safety fallback if category is not found in library
    if not category_candidates:
        return {
            "id": "REC_FALLBACK",
            "title": "Breathing & Posture Reset",
            "description": "Take 5 slow breaths and reset your seated posture.",
            "stress_category": [stress_category],
            "duration": available_time or "5 minutes",
            "context": [context or "Any"],
            "reason": f"General coping intervention adapted for {stress_category} stress level.",
        }

    # 2. Score candidates based on contextual flags and stressor hints
    def score_candidate(candidate: Dict[str, Any]) -> int:
        score = 0

        # Duration match (+3 points)
        if available_time:
            if candidate["duration"] == available_time:
                score += 3

        # Context match (+3 for exact, +2 for 'Any')
        if context:
            cand_contexts = candidate.get("context", [])
            if context in cand_contexts:
                score += 3
            elif "Any" in cand_contexts:
                score += 2

        # Stressor alignment (+2 points)
        if stressor_hint:
            hint_lower = stressor_hint.lower()
            title_lower = candidate["title"].lower()
            reason_lower = candidate["reason"].lower()
            if hint_lower in title_lower or hint_lower in reason_lower:
                score += 2

        return score

    # Sort candidates by score descending, preserving library priority on ties
    scored_candidates = sorted(category_candidates, key=score_candidate, reverse=True)
    selected = scored_candidates[0].copy()

    # Build clear personalized selection rationale
    reasons: List[str] = [selected["reason"]]
    if available_time and selected["duration"] == available_time:
        reasons.append(f"Fits your selected {available_time} window.")
    if context and (context in selected.get("context", []) or "Any" in selected.get("context", [])):
        reasons.append(f"Appropriate for a {context} setting.")

    selected["selection_rationale"] = " ".join(reasons)
    return selected


def get_recommendation(
    stress_category: str,
    available_time: Optional[str] = None,
    context: Optional[str] = None,
    stressor_hint: Optional[str] = None,
) -> Dict[str, Any]:
    """Alias for select_coping_recommendation."""
    return select_coping_recommendation(
        stress_category, available_time, context, stressor_hint
    )
