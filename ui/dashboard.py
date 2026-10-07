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


def render_assessment_dashboard() -> None:
    """Render the primary interactive assessment and results interface."""
    st.markdown("### 🫀 Physiological & Behavioral Parameters")
    st.caption("Adjust your current parameters below to evaluate real-time stress and receive an adaptive recommendation.")

    # Two-column layout: Inputs on left, contextual flags on right
    col_inputs, col_context = st.columns([3, 2], gap="medium")

    with col_inputs:
        hrv_val = st.slider(
            "Heart Rate Variability (HRV in ms):",
            min_value=float(UNIVERSE_CONFIG["hrv"]["min"]),
            max_value=float(UNIVERSE_CONFIG["hrv"]["max"]),
            value=float(st.session_state.get("hrv_val", UNIVERSE_CONFIG["hrv"]["default"])),
            step=float(UNIVERSE_CONFIG["hrv"]["step"]),
            help="Higher HRV indicates stronger parasympathetic (vagal) activity and resilience to stress.",
            key="slider_hrv",
        )

        screen_val = st.slider(
            "Daily Screen Time (hours):",
            min_value=float(UNIVERSE_CONFIG["screen_time"]["min"]),
            max_value=float(UNIVERSE_CONFIG["screen_time"]["max"]),
            value=float(st.session_state.get("screen_val", UNIVERSE_CONFIG["screen_time"]["default"])),
            step=float(UNIVERSE_CONFIG["screen_time"]["step"]),
            help="Total daily exposure across computers, tablets, and smartphones.",
            key="slider_screen",
        )

        sleep_val = st.slider(
            "Sleep Duration (hours):",
            min_value=float(UNIVERSE_CONFIG["sleep_duration"]["min"]),
            max_value=float(UNIVERSE_CONFIG["sleep_duration"]["max"]),
            value=float(st.session_state.get("sleep_val", UNIVERSE_CONFIG["sleep_duration"]["default"])),
            step=float(UNIVERSE_CONFIG["sleep_duration"]["step"]),
            help="Hours of sleep obtained during the previous 24-hour cycle.",
            key="slider_sleep",
        )

    with col_context:
        st.markdown("#### 🎯 Contextual Preferences (Optional)")
        st.caption("Used exclusively to tailor coping interventions to your setting.")

        time_option = st.selectbox(
            "Available Time for Coping Action:",
            options=AVAILABLE_TIME_OPTIONS,
            index=0,
            help="Select how much time you currently have available for a stress reduction break.",
            key="select_time",
        )

        context_option = st.selectbox(
            "Current Physical Context / Location:",
            options=CONTEXT_OPTIONS,
            index=0,
            help="Select your current environment so the recommendation is practical and actionable.",
            key="select_context",
        )

        st.markdown("---")
        auto_reeval = st.checkbox("Continuous Real-Time Re-evaluation", value=True, help="Automatically update analysis on slider adjustment.")
        analyze_clicked = st.button("🔍 Analyze Stress & Recommend Action", type="primary", use_container_width=True)

    # Trigger analysis if button clicked or continuous mode is on
    should_run = analyze_clicked or auto_reeval

    if should_run:
        # Preprocessing & Validation
        val_error = validate_inputs(hrv_val, screen_val, sleep_val)
        if val_error:
            st.error(f"⚠️ Input Validation Error: {val_error}")
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

        st.markdown("---")
        st.markdown("## 📊 Assessment Results & Recommendation")

        # Top metric row: Stress Index and Badge
        res_col1, res_col2 = st.columns([1, 2], gap="medium")
        badge = get_category_badge_info(stress_category)

        with res_col1:
            st.metric(
                label="Defuzzified Stress Index",
                value=f"{crisp_stress:.1f} / 100",
                delta=f"Range: 0-100",
                delta_color="off",
            )

        with res_col2:
            st.markdown(
                f"""
                <div style="background-color: {badge['bg_color']}; border-left: 6px solid {badge['color']}; padding: 14px 20px; border-radius: 6px; margin-top: 5px;">
                    <div style="font-size: 1.25rem; font-weight: bold; color: {badge['color']}; letter-spacing: 0.5px;">
                        {badge['label']}
                    </div>
                    <div style="font-size: 0.95rem; color: #333333; margin-top: 4px;">
                        {badge['description']}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.write("")

        # Two-column layout: Recommendation on left, Membership Table on right
        rec_col, memb_col = st.columns([1, 1], gap="medium")

        with rec_col:
            st.markdown("#### 💡 Tailored Coping Recommendation")
            st.markdown(
                f"""
                <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 1.15rem; font-weight: bold; color: #212529;">{recommendation['title']}</span>
                        <span style="background: #e7f5ff; color: #1971c2; font-weight: 600; font-size: 0.82rem; padding: 3px 10px; border-radius: 12px;">⏱️ {recommendation['duration']}</span>
                    </div>
                    <p style="color: #495057; font-size: 0.95rem; margin-top: 10px; line-height: 1.45;">{recommendation['description']}</p>
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 10px 12px; margin-top: 12px;">
                        <span style="font-size: 0.82rem; font-weight: bold; color: #495057;">Why this was recommended:</span>
                        <p style="font-size: 0.86rem; color: #6c757d; margin: 4px 0 0 0;">{recommendation.get('selection_rationale', recommendation.get('reason'))}</p>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with memb_col:
            st.markdown("#### 🔬 Fuzzification Breakdown")
            # Build DataFrame of membership degrees
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
            df_m = pd.DataFrame(m_data)
            st.dataframe(df_m, use_container_width=True, hide_index=True)

            # Show identified stress drivers
            st.caption("🔍 **Dominant Contributing Factors:**")
            for driver in explanation["stress_drivers"]:
                st.markdown(f"- {driver}")

        st.write("")

        # Transparency Panel (Expander)
        with st.expander("🔎 Transparency Panel — Active Rules & Firing Strengths", expanded=False):
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
                        "Firing Strength (α)": f"{r.firing_strength:.4f}",
                        "Rationale": r.rationale,
                    })
                df_rules = pd.DataFrame(rule_rows)
                st.dataframe(df_rules, use_container_width=True, hide_index=True)
            else:
                st.info("No active rules exceeded activation threshold.")

            st.markdown("##### Plain Text Explanation Dump")
            st.code(explanation["formatted_text"], language="text")

        # Full 27 Core + 4 Supplementary Rule Base (Expander)
        with st.expander("📚 Complete Fuzzy Rule Base (31 Rules)", expanded=False):
            st.markdown("#### Complete Knowledge Base Reference")
            st.caption("Layer A: 27 exhaustive 3-input combinations | Layer B: 4 Stage 2 supplementary 2-input rules")

            all_rules_rows = []
            for r in ALL_RULES_DATA:
                ant_str = " AND ".join([f"{k.replace('_', ' ').title()}={v.title()}" for k, v in r["antecedent"].items()])
                all_rules_rows.append({
                    "ID": r["id"],
                    "Doc ID": r.get("report_id") or "-",
                    "Layer": r["type"].capitalize(),
                    "Documented in Report": "✅ Yes" if r.get("is_documented") else "No",
                    "Antecedents": ant_str,
                    "Consequent": r["consequent"].title(),
                    "Default Coping Action": r["recommendation_hint"],
                    "Rationale": r["rationale"],
                })
            df_all = pd.DataFrame(all_rules_rows)
            st.dataframe(df_all, use_container_width=True, hide_index=True)
