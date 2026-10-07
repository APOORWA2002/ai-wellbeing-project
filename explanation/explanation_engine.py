"""Explanation Engine providing transparent reasoning and active rule breakdowns.

Builds structured explanations for every inference pass, detailing membership degrees,
active rule firing strengths, dominant physiological stressors, and recommendation rationale.
"""

from typing import Dict, List, Any, Optional
from fuzzy_engine.inference import InferenceResult, RuleFiring


def identify_stress_drivers(memberships: Dict[str, Dict[str, float]]) -> List[str]:
    """Identify the dominant contributing stress drivers based on membership degrees."""
    drivers: List[str] = []

    hrv_low = memberships.get("hrv", {}).get("low", 0.0)
    screen_prolonged = memberships.get("screen_time", {}).get("prolonged", 0.0)
    sleep_inadequate = memberships.get("sleep_duration", {}).get("inadequate", 0.0)
    sleep_marginal = memberships.get("sleep_duration", {}).get("marginal", 0.0)

    if hrv_low >= 0.3:
        drivers.append(f"Low Heart Rate Variability (degree: {hrv_low:.2f}) indicating autonomic parasympathetic suppression")
    if screen_prolonged >= 0.3:
        drivers.append(f"Prolonged Screen Time (degree: {screen_prolonged:.2f}) indicating digital fatigue & sensory overload")
    if sleep_inadequate >= 0.3:
        drivers.append(f"Inadequate Sleep (degree: {sleep_inadequate:.2f}) indicating severe circadian & physical debt")
    elif sleep_marginal >= 0.5:
        drivers.append(f"Marginal Sleep (degree: {sleep_marginal:.2f}) reflecting borderline restorative rest")

    if not drivers:
        drivers.append("Balanced physiological markers with low acute stress indicators")

    return drivers


def format_text_explanation(
    crisp_index: float,
    category: str,
    inputs: Dict[str, float],
    memberships: Dict[str, Dict[str, float]],
    active_rules: List[RuleFiring],
    recommendation: Dict[str, Any],
) -> str:
    """Generate a clean human-readable plain text explanation matching Section 13 format."""
    lines = [
        f"Stress Index: {crisp_index:.0f} / 100  ->  {category.upper()}",
        "",
        "Membership Degrees:",
        f"  HRV {inputs.get('hrv', 0):.0f} ms   ->  Low: {memberships['hrv']['low']:.2f} | Normal: {memberships['hrv']['normal']:.2f} | High: {memberships['hrv']['high']:.2f}",
        f"  Screen {inputs.get('screen_time', 0):.1f}h ->  Short: {memberships['screen_time']['short']:.2f} | Moderate: {memberships['screen_time']['moderate']:.2f} | Prolonged: {memberships['screen_time']['prolonged']:.2f}",
        f"  Sleep {inputs.get('sleep_duration', 0):.1f}h  ->  Inadequate: {memberships['sleep_duration']['inadequate']:.2f} | Marginal: {memberships['sleep_duration']['marginal']:.2f} | Optimal: {memberships['sleep_duration']['optimal']:.2f}",
        "",
        "Active Rules:",
    ]

    if active_rules:
        for r in active_rules:
            lines.append(f"  {r.rule_id:<4} [{r.condition_text}]  ->  {r.consequent}  (strength: {r.firing_strength:.2f})")
    else:
        lines.append("  No individual rule fired above activation threshold.")

    lines.extend([
        "",
        f"Recommendation: {recommendation.get('title', 'N/A')}",
        f"Reason: {recommendation.get('selection_rationale', recommendation.get('reason', 'N/A'))}",
    ])

    return "\n".join(lines)


def generate_explanation(
    inference_result: InferenceResult,
    stress_category: str,
    recommendation: Dict[str, Any],
) -> Dict[str, Any]:
    """Compile structured explanation payload from inference results and recommendation.

    Args:
        inference_result: Result object from fuzzy inference.
        stress_category: Linguistic category ("Low", "Medium", or "High").
        recommendation: Coping recommendation dict.

    Returns:
        Dict[str, Any]: Comprehensive explanation payload.
    """
    inputs = inference_result.inputs
    memberships = inference_result.memberships
    active_rules = inference_result.active_rules
    crisp_index = inference_result.crisp_stress_index

    # Identify primary physiological/behavioral stress drivers
    stress_drivers = identify_stress_drivers(memberships)

    # Format plain text and markdown summaries
    text_summary = format_text_explanation(
        crisp_index,
        stress_category,
        inputs,
        memberships,
        active_rules,
        recommendation,
    )

    return {
        "crisp_stress_index": crisp_index,
        "stress_category": stress_category,
        "inputs": inputs,
        "memberships": memberships,
        "active_rules": [
            {
                "rule_id": r.rule_id,
                "doc_id": r.doc_id,
                "rule_type": r.rule_type,
                "condition": r.condition_text,
                "consequent": r.consequent,
                "firing_strength": r.firing_strength,
                "rationale": r.rationale,
            }
            for r in active_rules
        ],
        "stress_drivers": stress_drivers,
        "recommendation": recommendation,
        "formatted_text": text_summary,
    }
