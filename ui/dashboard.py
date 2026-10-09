"""Streamlit Dashboard Module: Input handling, analysis execution, and results rendering.

Implements the user interface specified in Section 14 of the specification:
- User Input sliders and contextual selects
- Real-time input validation
- Stress Index score metric card & colored category badge
- Fuzzy membership degrees breakdown table
- Adaptive coping recommendation card
- Transparent rule activation expander
- Complete rule base reference expander
"""

from typing import Dict, Any, Optional
import streamlit as st
import pandas as pd

from config.fuzzy_config import (
    UNIVERSE_CONFIG,
    AVAILABLE_TIME_OPTIONS,
    CONTEXT_OPTIONS,
    STRESS_THRESHOLDS,
)
from fuzzy_engine.inference import run_fuzzy_inference, InferenceResult
from fuzzy_engine.classifier import classify_stress, get_category_badge_info
from recommendation.recommendation_engine import select_coping_recommendation
from explanation.explanation_engine import generate_explanation
from fuzzy_engine.rules import ALL_RULES_DATA
from ui.theme import (
    section_header,
    mini_label,
    score_card,
    status_card,
    recommendation_card,
    empty_state,
    steps_strip,
    hint_card,
)


def validate_inputs(hrv: float, screen_time: float, sleep_duration: float) -> Optional[str]:
    """Validate that input values conform strictly to declared ranges and types."""
    hrv_cfg = UNIVERSE_CONFIG["hrv"]
    if not (hrv_cfg["min"] <= hrv <= hrv_cfg["max"]):
        return f"HRV value {hrv} ms is out of valid range [{hrv_cfg['min']}, {hrv_cfg['max']}] ms."

    sc_cfg = UNIVERSE_CONFIG["screen_time"]
    if not (sc_cfg["min"] <= screen_time <= sc_cfg["max"]):
        return f"Screen Time {screen_time} h is out of valid range [{sc_cfg['min']}, {sc_cfg['max']}] h."

    sl_cfg = UNIVERSE_CONFIG["sleep_duration"]
    if not (sl_cfg["min"] <= sleep_duration <= sl_cfg["max"]):
        return f"Sleep Duration {sleep_duration} h is out of valid range [{sl_cfg['min']}, {sl_cfg['max']}] h."

    return None



# ------------------------------------------------------------------------------
# INPUT STATE HELPERS (shared with the sidebar presets in app.py)
# ------------------------------------------------------------------------------
def init_inputs() -> None:
    """Make sure every input widget has a starting value in session state."""
    st.session_state.setdefault("slider_hrv", float(UNIVERSE_CONFIG["hrv"]["default"]))
    st.session_state.setdefault("slider_screen", float(UNIVERSE_CONFIG["screen_time"]["default"]))
    st.session_state.setdefault("slider_sleep", float(UNIVERSE_CONFIG["sleep_duration"]["default"]))


def apply_preset(hrv: float, screen: float, sleep: float, name: str) -> None:
    """Button callback: load a scenario into the sliders."""
    st.session_state["slider_hrv"] = float(hrv)
    st.session_state["slider_screen"] = float(screen)
    st.session_state["slider_sleep"] = float(sleep)
    st.toast(f"{name} scenario loaded")


def reset_inputs() -> None:
    """Button callback: return every input to its default."""
    st.session_state["slider_hrv"] = float(UNIVERSE_CONFIG["hrv"]["default"])
    st.session_state["slider_screen"] = float(UNIVERSE_CONFIG["screen_time"]["default"])
    st.session_state["slider_sleep"] = float(UNIVERSE_CONFIG["sleep_duration"]["default"])
    st.session_state["select_time"] = AVAILABLE_TIME_OPTIONS[0]
    st.session_state["select_context"] = CONTEXT_OPTIONS[0]
    st.toast("Inputs reset to defaults")


def render_assessment_dashboard() -> None:
    """Render the primary interactive assessment and results interface."""
    init_inputs()
    steps_strip(["Set your inputs", "Review your stress level", "Follow the suggested action"])
    section_header(
        "Step 1 \u00b7 Input",
        "Physiological & Behavioral Parameters",
        "Adjust your current parameters below to evaluate real-time stress and receive an adaptive recommendation.",
    )

    with st.container(border=True, key="input_card"):
        # Row 1: the three physiological inputs side by side
        col_hrv, col_screen, col_sleep = st.columns(3, gap="large")

        with col_hrv:
            hrv_val = st.slider(
                "Heart Rate Variability (HRV in ms):",
                min_value=float(UNIVERSE_CONFIG["hrv"]["min"]),
                max_value=float(UNIVERSE_CONFIG["hrv"]["max"]),
                step=float(UNIVERSE_CONFIG["hrv"]["step"]),
                help="Higher HRV indicates stronger parasympathetic (vagal) activity and resilience to stress.",
                key="slider_hrv",
            )
            st.caption("Higher usually means better recovery.")

        with col_screen:
            screen_val = st.slider(
                "Daily Screen Time (hours):",
                min_value=float(UNIVERSE_CONFIG["screen_time"]["min"]),
                max_value=float(UNIVERSE_CONFIG["screen_time"]["max"]),
                step=float(UNIVERSE_CONFIG["screen_time"]["step"]),
                help="Total daily exposure across computers, tablets, and smartphones.",
                key="slider_screen",
            )
            st.caption("Less screen time is generally better.")

        with col_sleep:
            sleep_val = st.slider(
                "Sleep Duration (hours):",
                min_value=float(UNIVERSE_CONFIG["sleep_duration"]["min"]),
                max_value=float(UNIVERSE_CONFIG["sleep_duration"]["max"]),
                step=float(UNIVERSE_CONFIG["sleep_duration"]["step"]),
                help="Hours of sleep obtained during the previous 24-hour cycle.",
                key="slider_sleep",
            )
            st.caption("Most adults need around 7\u20139 hours.")

        st.markdown("<hr/>", unsafe_allow_html=True)
        mini_label("Contextual preferences (optional)")
        st.caption("Used exclusively to tailor coping interventions to your setting.")

        # Row 2: optional context + actions
        col_time, col_ctx, col_act = st.columns([1, 1, 1.25], gap="large")

        with col_time:
            time_option = st.selectbox(
                "Available Time for Coping Action:",
                options=AVAILABLE_TIME_OPTIONS,
                index=0,
                help="Select how much time you currently have available for a stress reduction break.",
                key="select_time",
            )

        with col_ctx:
            context_option = st.selectbox(
                "Current Physical Context / Location:",
                options=CONTEXT_OPTIONS,
                index=0,
                help="Select your current environment so the recommendation is practical and actionable.",
                key="select_context",
            )

        with col_act:
            auto_reeval = st.checkbox("Continuous Real-Time Re-evaluation", value=True, help="Automatically update analysis on slider adjustment.")
            analyze_clicked = st.button("Analyze Stress & Recommend Action", type="primary", width="stretch")
            st.button("Reset inputs", on_click=reset_inputs, width="stretch", key="reset_inputs")

    # Trigger analysis if button clicked or continuous mode is on
    should_run = analyze_clicked or auto_reeval

    if not should_run:
        st.write("")
        empty_state(
            "No assessment yet",
            "Press \u201cAnalyze Stress & Recommend Action\u201d, or switch continuous re-evaluation back on, to see your results.",
        )
        return

    # Preprocessing & Validation
    val_error = validate_inputs(hrv_val, screen_val, sleep_val)
    if val_error:
        st.error(f"Input Validation Error: {val_error}")
        return

    # Execute Pipeline
    with st.spinner("Executing Mamdani Fuzzy Inference & Centroid Defuzzification..."):
        inference_result = run_fuzzy_inference(hrv_val, screen_val, sleep_val)
        crisp_stress = inference_result.crisp_stress_index
        stress_category = classify_stress(crisp_stress)

        # Determine dominant stressor hint for recommendation engine
        memberships = inference_result.memberships
        stressor_hint = None
        if memberships["sleep_duration"]["inadequate"] >= 0.4:
            stressor_hint = "sleep"
        elif memberships["screen_time"]["prolonged"] >= 0.4:
            stressor_hint = "screen"
        elif memberships["hrv"]["low"] >= 0.5:
            stressor_hint = "breathing"

        # Decoupled Recommendation Engine
        recommendation = select_coping_recommendation(
            stress_category=stress_category,
            available_time=time_option,
            context=context_option,
            stressor_hint=stressor_hint,
        )

        # Explanation Generation
        explanation = generate_explanation(inference_result, stress_category, recommendation)

        # Save in session state for cross-tab visualization
        st.session_state["last_inference"] = inference_result
        st.session_state["last_category"] = stress_category
        st.session_state["last_recommendation"] = recommendation
        st.session_state["last_explanation"] = explanation

    section_header("Step 2 \u00b7 Results", "Assessment Results & Recommendation")

    # Row 1: Stress Index score + category status
    res_col1, res_col2 = st.columns([1, 1], gap="medium")
    badge = get_category_badge_info(stress_category)

    with res_col1:
        score_card(
            crisp_stress,
            medium_min=STRESS_THRESHOLDS.get("medium_min", 40.0),
            high_min=STRESS_THRESHOLDS.get("high_min", 70.0),
        )

    with res_col2:
        status_card(stress_category, badge["label"], badge["description"])

    # Row 2: the recommended action (full width, easy to read)
    section_header("Step 3 \u00b7 Action", "Your Tailored Coping Recommendation")
    recommendation_card(
        recommendation["title"],
        recommendation["duration"],
        recommendation["description"],
        recommendation.get("selection_rationale", recommendation.get("reason")),
    )
    if stress_category in ("Medium", "High"):
        st.write("")
        hint_card("Want to talk it through?", "Open the Wellbeing Chat tab for a calm, guided check-in.")
    st.write("")
    st.download_button(
        "Download this assessment (.txt)",
        data=explanation["formatted_text"],
        file_name="stress_assessment.txt",
        mime="text/plain",
        key="download_assessment",
    )

    st.write("")

    # Row 3: calculation details tucked away until wanted
    with st.expander("How was this calculated? (membership degrees & contributing factors)", expanded=False):
        mini_label("Fuzzification breakdown")
        m_data = {
            "Input Variable": [
                f"HRV ({hrv_val:.0f} ms)",
                f"Screen Time ({screen_val:.1f} h)",
                f"Sleep Duration ({sleep_val:.1f} h)",
            ],
            "Low / Short / Inadequate": [
                f"{memberships['hrv']['low']:.2f}",
                f"{memberships['screen_time']['short']:.2f}",
                f"{memberships['sleep_duration']['inadequate']:.2f}",
            ],
            "Normal / Moderate / Marginal": [
                f"{memberships['hrv']['normal']:.2f}",
                f"{memberships['screen_time']['moderate']:.2f}",
                f"{memberships['sleep_duration']['marginal']:.2f}",
            ],
            "High / Prolonged / Optimal": [
                f"{memberships['hrv']['high']:.2f}",
                f"{memberships['screen_time']['prolonged']:.2f}",
                f"{memberships['sleep_duration']['optimal']:.2f}",
            ],
        }
        st.dataframe(pd.DataFrame(m_data), width="stretch", hide_index=True)

        st.write("")
        mini_label("Dominant contributing factors")
        for driver in explanation["stress_drivers"]:
            st.markdown(f"- {driver}")

    # Transparency Panel (Expander)
    with st.expander("Transparency Panel \u2014 Active Rules & Firing Strengths", expanded=False):
        st.markdown("#### Evaluated Mamdani Fuzzy Rules")
        st.caption("Shows all rules where antecedent membership degree > 0.0, sorted by firing strength (Mamdani Min operator).")

        active_rules = inference_result.active_rules
        if active_rules:
            rule_rows = []
            for r in active_rules:
                rule_rows.append({
                    "Rule ID": r.rule_id,
                    "Type": r.rule_type.capitalize(),
                    "Condition (Antecedents)": r.condition_text,
                    "Consequent": r.consequent,
                    "Firing Strength (\u03b1)": f"{r.firing_strength:.4f}",
                    "Rationale": r.rationale,
                })
            df_rules = pd.DataFrame(rule_rows)
            st.dataframe(df_rules, width="stretch", hide_index=True)
        else:
            st.info("No active rules exceeded activation threshold.")

        st.markdown("##### Plain Text Explanation Dump")
        st.code(explanation["formatted_text"], language="text")

    # Full 27 Core + 4 Supplementary Rule Base (Expander)
    with st.expander("Complete Fuzzy Rule Base (31 Rules)", expanded=False):
        st.markdown("#### Complete Knowledge Base Reference")
        st.caption("Layer A: 27 exhaustive 3-input combinations | Layer B: 4 Stage 2 supplementary 2-input rules")

        all_rules_rows = []
        for r in ALL_RULES_DATA:
            ant_str = " AND ".join([f"{k.replace('_', ' ').title()}={v.title()}" for k, v in r["antecedent"].items()])
            all_rules_rows.append({
                "ID": r["id"],
                "Doc ID": r.get("report_id") or "-",
                "Layer": r["type"].capitalize(),
                "Documented in Report": "Yes" if r.get("is_documented") else "No",
                "Antecedents": ant_str,
                "Consequent": r["consequent"].title(),
                "Default Coping Action": r["recommendation_hint"],
                "Rationale": r["rationale"],
            })
        df_all = pd.DataFrame(all_rules_rows)
        st.dataframe(df_all, width="stretch", hide_index=True)
