"""Fuzzy rule definitions for the Mamdani Fuzzy Inference System.

Contains:
1. Layer A: 27 exhaustive 3-input rules (C01–C27) covering every combination of
   (HRV: low/normal/high) x (Screen: short/moderate/prolonged) x (Sleep: inadequate/marginal/optimal).
   Includes R1, R2, R3, and R8 from the Stage 2 report verbatim with documentary metadata.
2. Layer B: 4 supplementary 2-input rules from the Stage 2 report (R4, R5, R6, R7).
3. Programmatic validation function to verify complete Cartesian coverage of the 27 combinations.
"""

import itertools
from typing import Dict, List, Any, Tuple
from skfuzzy import control as ctrl

from config.fuzzy_config import HRV_TERMS, SCREEN_TERMS, SLEEP_TERMS


# ==============================================================================
# LAYER A: 27 CORE THREE-INPUT RULES (C01 - C27)
# ==============================================================================
# Constructed following the heuristic in Section 18:
# - Stress-associated: Low HRV, Prolonged Screen, Inadequate Sleep
# - Positive: High HRV, Short Screen, Optimal Sleep
# - Neutral: Normal HRV, Moderate Screen, Marginal Sleep
#
# Rules:
# - High: >= 2 stress-associated terms
# - Low: 0 stress-associated terms AND >= 2 positive terms
# - Medium: remaining mixed/intermediate combinations
# Documented R1, R2, R3, R8 preserved verbatim!

CORE_RULES_DATA: List[Dict[str, Any]] = [
    # --------------------------------------------------------------------------
    # HRV = LOW (1 stress factor)
    # --------------------------------------------------------------------------
    {
        "id": "C01",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "short", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "Two stress-associated conditions present (Low HRV, Inadequate Sleep); single positive factor (Short Screen) does not override them.",
        "is_documented": False,
    },
    {
        "id": "C02",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "short", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Breathing Exercise",
        "rationale": "Mixed profile: one stress-associated factor (Low HRV), one neutral (Marginal Sleep), and one positive (Short Screen).",
        "is_documented": False,
    },
    {
        "id": "C03",
        "report_id": "R8",
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "short", "sleep_duration": "optimal"},
        "consequent": "medium",
        "recommendation_hint": "Monitor / Breathing Exercise",
        "rationale": "Preserved verbatim from Stage 2 report (R8): Low HRV warrants calming and monitoring despite short screen and optimal sleep.",
        "is_documented": True,
    },
    {
        "id": "C04",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "moderate", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "Two stress-associated conditions present (Low HRV, Inadequate Sleep); moderate screen time provides no protective offset.",
        "is_documented": False,
    },
    {
        "id": "C05",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "moderate", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Breathing Exercise",
        "rationale": "One stress-associated factor (Low HRV) accompanied by neutral screen and sleep demands.",
        "is_documented": False,
    },
    {
        "id": "C06",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "moderate", "sleep_duration": "optimal"},
        "consequent": "medium",
        "recommendation_hint": "Monitor / Breathing Exercise",
        "rationale": "One stress-associated factor (Low HRV) buffered by optimal sleep and moderate screen engagement.",
        "is_documented": False,
    },
    {
        "id": "C07",
        "report_id": "R1",
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "prolonged", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Active Cardio Break",
        "rationale": "Preserved verbatim from Stage 2 report (R1): All three stress-associated conditions present simultaneously.",
        "is_documented": True,
    },
    {
        "id": "C08",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "prolonged", "sleep_duration": "marginal"},
        "consequent": "high",
        "recommendation_hint": "Digital Detox Reminder",
        "rationale": "Two stress-associated conditions present (Low HRV, Prolonged Screen); drives high cumulative strain.",
        "is_documented": False,
    },
    {
        "id": "C09",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "low", "screen_time": "prolonged", "sleep_duration": "optimal"},
        "consequent": "high",
        "recommendation_hint": "Short Walk Break",
        "rationale": "Two stress-associated conditions present (Low HRV, Prolonged Screen); single positive factor (Optimal Sleep) does not override them.",
        "is_documented": False,
    },

    # --------------------------------------------------------------------------
    # HRV = NORMAL (0 stress factors from HRV)
    # --------------------------------------------------------------------------
    {
        "id": "C10",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "short", "sleep_duration": "inadequate"},
        "consequent": "medium",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "Single stress-associated factor (Inadequate Sleep) balanced by normal autonomic baseline and short screen use.",
        "is_documented": False,
    },
    {
        "id": "C11",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "short", "sleep_duration": "marginal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions; favorable short screen time and normal HRV sustain a low-stress state.",
        "is_documented": False,
    },
    {
        "id": "C12",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "short", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions and two positive terms (Short Screen, Optimal Sleep) produce a low-stress state.",
        "is_documented": False,
    },
    {
        "id": "C13",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "moderate", "sleep_duration": "inadequate"},
        "consequent": "medium",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "Single stress-associated factor (Inadequate Sleep) with neutral HRV and screen habits.",
        "is_documented": False,
    },
    {
        "id": "C14",
        "report_id": "R3",
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "moderate", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Breathing Exercise",
        "rationale": "Preserved verbatim from Stage 2 report (R3): All three parameters at neutral/intermediate baseline.",
        "is_documented": True,
    },
    {
        "id": "C15",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "moderate", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions; optimal sleep easily accommodates moderate study screen time.",
        "is_documented": False,
    },
    {
        "id": "C16",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "prolonged", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Digital Detox Reminder",
        "rationale": "Two stress-associated conditions present (Prolonged Screen, Inadequate Sleep) overwhelm normal baseline HRV.",
        "is_documented": False,
    },
    {
        "id": "C17",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "prolonged", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Short Walk Break",
        "rationale": "One stress-associated factor (Prolonged Screen) on a neutral autonomic and sleep baseline.",
        "is_documented": False,
    },
    {
        "id": "C18",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "normal", "screen_time": "prolonged", "sleep_duration": "optimal"},
        "consequent": "medium",
        "recommendation_hint": "Short Walk Break",
        "rationale": "One stress-associated factor (Prolonged Screen) balanced by optimal restorative sleep.",
        "is_documented": False,
    },

    # --------------------------------------------------------------------------
    # HRV = HIGH (1 positive factor from HRV)
    # --------------------------------------------------------------------------
    {
        "id": "C19",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "short", "sleep_duration": "inadequate"},
        "consequent": "medium",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "One stress-associated factor (Inadequate Sleep) offset by two positive factors (High HRV, Short Screen).",
        "is_documented": False,
    },
    {
        "id": "C20",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "short", "sleep_duration": "marginal"},
        "consequent": "low",
        "recommendation_hint": "No Action Needed",
        "rationale": "Zero stress-associated conditions and two positive terms (High HRV, Short Screen) ensure a low-stress state.",
        "is_documented": False,
    },
    {
        "id": "C21",
        "report_id": "R2",
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "short", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "No Action Needed",
        "rationale": "Preserved verbatim from Stage 2 report (R2): All three terms positive (High HRV, Short Screen, Optimal Sleep).",
        "is_documented": True,
    },
    {
        "id": "C22",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "moderate", "sleep_duration": "inadequate"},
        "consequent": "medium",
        "recommendation_hint": "Breathing Exercise",
        "rationale": "One stress-associated factor (Inadequate Sleep) moderated by high parasympathetic resilience.",
        "is_documented": False,
    },
    {
        "id": "C23",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "moderate", "sleep_duration": "marginal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions; robust autonomic flexibility absorbs moderate work and slight sleep deficit.",
        "is_documented": False,
    },
    {
        "id": "C24",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "moderate", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions and two positive terms (High HRV, Optimal Sleep) yield a low-stress state.",
        "is_documented": False,
    },
    {
        "id": "C25",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "prolonged", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Active Cardio Break",
        "rationale": "Two stress-associated conditions present (Prolonged Screen, Inadequate Sleep); single positive factor (High HRV) does not override them.",
        "is_documented": False,
    },
    {
        "id": "C26",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "prolonged", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Short Walk Break",
        "rationale": "One stress-associated factor (Prolonged Screen) moderated by high parasympathetic tone.",
        "is_documented": False,
    },
    {
        "id": "C27",
        "report_id": None,
        "type": "core",
        "antecedent": {"hrv": "high", "screen_time": "prolonged", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Zero stress-associated conditions; two positive terms (High HRV, Optimal Sleep) effectively neutralize prolonged screen time.",
        "is_documented": False,
    },
]

# ==============================================================================
# LAYER B: 4 SUPPLEMENTARY TWO-ANTECEDENT RULES (R4, R5, R6, R7)
# ==============================================================================
# Documented in Stage 2 report; preserved as separate broader rules.

SUPPLEMENTARY_RULES_DATA: List[Dict[str, Any]] = [
    {
        "id": "R4",
        "report_id": "R4",
        "type": "supplementary",
        "antecedent": {"hrv": "low", "sleep_duration": "inadequate"},
        "consequent": "high",
        "recommendation_hint": "Sleep Hygiene Tip",
        "rationale": "Preserved verbatim from Stage 2 report (R4): Severe autonomic depression combined with acute sleep deprivation directly triggers high stress.",
        "is_documented": True,
    },
    {
        "id": "R5",
        "report_id": "R5",
        "type": "supplementary",
        "antecedent": {"screen_time": "prolonged", "sleep_duration": "marginal"},
        "consequent": "medium",
        "recommendation_hint": "Digital Detox Reminder",
        "rationale": "Preserved verbatim from Stage 2 report (R5): Digital screen overload paired with marginal sleep creates moderate cognitive strain.",
        "is_documented": True,
    },
    {
        "id": "R6",
        "report_id": "R6",
        "type": "supplementary",
        "antecedent": {"hrv": "high", "sleep_duration": "optimal"},
        "consequent": "low",
        "recommendation_hint": "Maintain Routine",
        "rationale": "Preserved verbatim from Stage 2 report (R6): Synergistic high parasympathetic tone and optimal sleep support a low-stress state.",
        "is_documented": True,
    },
    {
        "id": "R7",
        "report_id": "R7",
        "type": "supplementary",
        "antecedent": {"hrv": "normal", "screen_time": "prolonged"},
        "consequent": "medium",
        "recommendation_hint": "Short Walk Break",
        "rationale": "Preserved verbatim from Stage 2 report (R7): Prolonged screen engagement on a normal baseline induces moderate physical fatigue.",
        "is_documented": True,
    },
]

ALL_RULES_DATA: List[Dict[str, Any]] = CORE_RULES_DATA + SUPPLEMENTARY_RULES_DATA


# ==============================================================================
# PROGRAMMATIC VALIDATION OF CORE RULE COVERAGE (Section 17)
# ==============================================================================

def validate_core_rule_coverage() -> Dict[str, Any]:
    """Programmatically verify that the 27 core rules cover the full Cartesian product.

    Checks:
    1. Generates Cartesian product of (HRV_TERMS x SCREEN_TERMS x SLEEP_TERMS).
    2. Extracts antecedent combination of every core rule.
    3. Confirms all 27 expected combinations exist.
    4. Confirms there are no duplicate core combinations.
    5. Confirms there are no missing combinations.
    6. Ignores the four supplementary rules during this check.

    Returns:
        Dict[str, Any]: Validation report with status, total_combinations, missing, duplicates.
    """
    expected_combinations = set(
        itertools.product(HRV_TERMS, SCREEN_TERMS, SLEEP_TERMS)
    )

    core_combinations: List[Tuple[str, str, str]] = []
    duplicates: List[Tuple[str, str, str]] = []
    seen: set = set()

    for rule in CORE_RULES_DATA:
        ant = rule["antecedent"]
        combo = (ant["hrv"], ant["screen_time"], ant["sleep_duration"])
        if combo in seen:
            duplicates.append(combo)
        else:
            seen.add(combo)
        core_combinations.append(combo)

    core_set = set(core_combinations)
    missing = expected_combinations - core_set
    is_valid = (len(expected_combinations) == 27 and
                len(core_combinations) == 27 and
                len(missing) == 0 and
                len(duplicates) == 0)

    return {
        "is_valid": is_valid,
        "expected_count": len(expected_combinations),
        "core_count": len(core_combinations),
        "unique_count": len(core_set),
        "missing_combinations": [list(m) for m in missing],
        "duplicate_combinations": [list(d) for d in duplicates],
    }


def build_skfuzzy_rules(
    hrv: ctrl.Antecedent,
    screen_time: ctrl.Antecedent,
    sleep_duration: ctrl.Antecedent,
    stress_index: ctrl.Consequent,
) -> List[ctrl.Rule]:
    """Convert structured rule dictionaries into scikit-fuzzy ctrl.Rule objects.

    Args:
        hrv: Heart Rate Variability Antecedent
        screen_time: Screen Time Antecedent
        sleep_duration: Sleep Duration Antecedent
        stress_index: Stress Index Consequent

    Returns:
        List[ctrl.Rule]: All 31 compiled scikit-fuzzy rules (27 core + 4 supplementary).
    """
    rules: List[ctrl.Rule] = []

    antecedent_map = {
        "hrv": hrv,
        "screen_time": screen_time,
        "sleep_duration": sleep_duration,
    }

    for rule_meta in ALL_RULES_DATA:
        antecedents = rule_meta["antecedent"]
        consequent_label = rule_meta["consequent"].lower()

        # Build composite antecedent clause with bitwise AND (&)
        clauses = []
        for var_name, term_label in antecedents.items():
            var_obj = antecedent_map[var_name]
            clauses.append(var_obj[term_label])

        composite_clause = clauses[0]
        for clause in clauses[1:]:
            composite_clause = composite_clause & clause

        rule_label = rule_meta["id"]
        if rule_meta.get("report_id"):
            rule_label = f"{rule_meta['id']} ({rule_meta['report_id']})"

        rule_obj = ctrl.Rule(
            antecedent=composite_clause,
            consequent=stress_index[consequent_label],
            label=rule_label,
        )
        rules.append(rule_obj)

    return rules
