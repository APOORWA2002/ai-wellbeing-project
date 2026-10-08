"""Streamlit Main Application Entry Point.

AI-Based Intelligent Solution for Healthcare & Well-being:
A Fuzzy Logic Approach to Real-Time Stress Classification and Adaptive Coping Recommendation

Course: Essentials of Artificial Intelligence – IT3182
Group: 12 | General Sir John Kotelawala Defence University, Faculty of Computing
"""

import streamlit as st
import pandas as pd
import os

from config.fuzzy_config import APP_METADATA, UNIVERSE_CONFIG
from ui.dashboard import render_assessment_dashboard, apply_preset
from ui.theme import (
    empty_state,
    inject_theme,
    sidebar_brand,
    side_label,
    key_value_rows,
    hero,
    section_header,
    stat_card,
    footer_note,
)
from ui.visualizations import (
    plot_hrv_mf,
    plot_screen_time_mf,
    plot_sleep_mf,
    plot_stress_output_mf,
    plot_architecture_pipeline,
)
from fuzzy_engine.inference import run_fuzzy_inference
from fuzzy_engine.classifier import classify_stress


def main() -> None:
    """Main application routine."""
    st.set_page_config(
        page_title="AI Well-being | Fuzzy Stress Classification",
        page_icon="🧠",
        layout="wide",
        initial_sidebar_state="auto",
    )

    inject_theme()

    # --------------------------------------------------------------------------
    # SIDEBAR: Project Info & Quick Presets
    # --------------------------------------------------------------------------
    with st.sidebar:
        sidebar_brand("AI Wellbeing", "Fuzzy stress classification")

        side_label("Quick scenarios")
        st.caption("Load a sample profile into the inputs.")

        st.button(
            "High Stress (Exam / Deadline)", width="stretch", key="preset_high",
            on_click=apply_preset, args=(30.0, 14.0, 3.5, "High stress"),
        )
        st.button(
            "Medium Stress (Average Workday)", width="stretch", key="preset_medium",
            on_click=apply_preset, args=(65.0, 7.0, 6.0, "Medium stress"),
        )
        st.button(
            "Low Stress (Rest & Recovery)", width="stretch", key="preset_low",
            on_click=apply_preset, args=(100.0, 2.0, 9.0, "Low stress"),
        )

        st.write("")
        with st.expander("About this system"):
            key_value_rows([
                ("Course", APP_METADATA["course"]),
                ("Group", APP_METADATA["group"].split("|")[0].strip()),
                ("Fuzzy model", "Mamdani FIS"),
                ("Defuzzification", "Centroid"),
                ("Rule base", "27 core + 4 supp."),
                ("Library", "scikit-fuzzy"),
            ], stacked=True)
            st.caption("General Sir John Kotelawala Defence University, Faculty of Computing")

    # --------------------------------------------------------------------------
    # PAGE HEADER
    # --------------------------------------------------------------------------
    hero(
        label=APP_METADATA["course"],
        title=APP_METADATA["title"],
        subtitle=APP_METADATA["subtitle"],
        badge_text="Academic prototype \u00b7 educational estimate, not medical advice",
    )

    # --------------------------------------------------------------------------
    # NAVIGATION TABS
    # --------------------------------------------------------------------------
    tab_dashboard, tab_visuals, tab_arch, tab_dataset = st.tabs([
        "Real-Time Assessment",
        "Membership Functions",
        "Architecture",
        "Dataset & Batch",
    ])

    # --------------------------------------------------------------------------
    # TAB 1: Assessment Dashboard
    # --------------------------------------------------------------------------
    with tab_dashboard:
        render_assessment_dashboard()

    # --------------------------------------------------------------------------
    # TAB 2: Membership Visualizations
    # --------------------------------------------------------------------------
    with tab_visuals:
        section_header(
            "Membership functions",
            "Fuzzy Set Visualizations & Dynamic Membership Markers",
            "Inspect the mathematical shape of each linguistic term across the universe of discourse. Vertical markers indicate your current active values.",
        )

        # Get latest active inputs from session state
        curr_hrv = st.session_state.get("slider_hrv", UNIVERSE_CONFIG["hrv"]["default"])
        curr_screen = st.session_state.get("slider_screen", UNIVERSE_CONFIG["screen_time"]["default"])
        curr_sleep = st.session_state.get("slider_sleep", UNIVERSE_CONFIG["sleep_duration"]["default"])

        last_inf = st.session_state.get("last_inference")
        curr_stress = last_inf.crisp_stress_index if last_inf else None
        agg_set = last_inf.aggregated_fuzzy_set if last_inf else None

        view = st.segmented_control(
            "Chart to display",
            ["All", "HRV", "Screen time", "Sleep", "Stress index"],
            default="All",
            label_visibility="collapsed",
            key="viz_view",
        ) or "All"
        st.write("")

        if view == "All":
            col_v1, col_v2 = st.columns(2, gap="large")
            with col_v1:
                st.pyplot(plot_hrv_mf(curr_hrv), width="stretch")
                st.pyplot(plot_sleep_mf(curr_sleep), width="stretch")
            with col_v2:
                st.pyplot(plot_screen_time_mf(curr_screen), width="stretch")
                st.pyplot(plot_stress_output_mf(curr_stress, agg_set), width="stretch")
        else:
            _, col_single, _ = st.columns([1, 3, 1])
            with col_single:
                if view == "HRV":
                    st.pyplot(plot_hrv_mf(curr_hrv), width="stretch")
                elif view == "Screen time":
                    st.pyplot(plot_screen_time_mf(curr_screen), width="stretch")
                elif view == "Sleep":
                    st.pyplot(plot_sleep_mf(curr_sleep), width="stretch")
                else:
                    st.pyplot(plot_stress_output_mf(curr_stress, agg_set), width="stretch")

        st.write("")
        st.info(
            "**Note on Centroid Defuzzification:** The shaded blue area in the Stress Index chart represents "
            "the aggregated consequent fuzzy set (Mamdani MAX operator applied across all active rule implications). "
            "The white vertical marker is the exact center of gravity (centroid) calculated across this continuous shape."
        )

    # --------------------------------------------------------------------------
    # TAB 3: System Pipeline & Architecture
    # --------------------------------------------------------------------------
    with tab_arch:
        section_header(
            "Architecture",
            "Eight-Stage End-to-End System Pipeline",
            "Visual representation of the decoupled software architecture, designed for university academic evaluation.",
        )

        st.pyplot(plot_architecture_pipeline(), width="stretch")

        section_header("Walkthrough", "Detailed Stage Walkthrough")
        col_s1, col_s2 = st.columns(2)

        with col_s1:
            st.markdown(
                r"""
                1. **User Input Stage:**
                   - Non-invasive data collection (HRV in ms, daily screen hours, prior sleep duration).
                   - Optional contextual flags (available time window, physical location).
                2. **Preprocessing & Validation:**
                   - Type verification, null-checks, and range boundary clamping.
                   - Clear error feedback via UI alerts.
                3. **AI Engine Layer (Mamdani FIS):**
                   - **3.1 Fuzzification:** Computes continuous membership degrees $\mu \in [0, 1]$ across linguistic terms.
                   - **3.2 Mamdani Inference:** Evaluates rule antecedents with fuzzy AND ($\min$ operator) and clips consequents.
                   - **3.3 Centroid Defuzzification:** Computes center-of-gravity crisp Stress Index ($0$–$100$).
                4. **Rule-Based Recommendation Engine:**
                   - Decoupled component taking the stress category and contextual flags.
                   - Strictly preserves stress category; refines action based on time and setting.
                """
            )

        with col_s2:
            st.markdown(
                r"""
                5. **Recommendation Output:**
                   - Returns tailored, evidence-informed coping action with duration, steps, and rationale.
                6. **Explanation & Transparency:**
                   - Structured decomposition of fired rules, firing strengths ($\alpha$), and contributing stress drivers.
                   - Ensures the system remains an open, transparent 'white-box' AI model.
                7. **Results Display:**
                   - Multi-faceted dashboard featuring score gauge, color-coded badges, membership table, and rule explorer.
                8. **Continuous Re-evaluation:**
                   - Reactive Streamlit execution loop enables instant re-evaluation whenever inputs are modified.
                """
            )

    # --------------------------------------------------------------------------
    # TAB 4: Synthetic Dataset & Batch Evaluation
    # --------------------------------------------------------------------------
    with tab_dataset:
        section_header(
            "Dataset",
            "Synthetic Dataset & Batch Model Validation",
            "Demonstration of model inference across the input space using the synthetic test dataset.",
        )

        dataset_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_stress_data.csv")

        if os.path.exists(dataset_path):
            df_synthetic = pd.read_csv(dataset_path, comment="#")
            with st.expander(f"Preview dataset ({len(df_synthetic)} samples, first 15 rows shown)", expanded=False):
                st.dataframe(df_synthetic.head(15), width="stretch")

            st.write("")
            if st.button("Run Full Batch Inference on Dataset", type="primary"):
                with st.spinner("Processing batch simulation through Mamdani engine..."):
                    results = []
                    for _, row in df_synthetic.iterrows():
                        res = run_fuzzy_inference(row["hrv_ms"], row["screen_time_h"], row["sleep_h"])
                        pred_cat = classify_stress(res.crisp_stress_index)
                        results.append({
                            "HRV (ms)": row["hrv_ms"],
                            "Screen (h)": row["screen_time_h"],
                            "Sleep (h)": row["sleep_h"],
                            "Stress Index": res.crisp_stress_index,
                            "Calculated Category": pred_cat,
                            "Reference Category": row.get("reference_category", "N/A"),
                            "Active Rules": len(res.active_rules),
                        })
                    st.session_state["batch_df"] = pd.DataFrame(results)

            df_batch = st.session_state.get("batch_df")
            if df_batch is None:
                st.write("")
                empty_state(
                    "No batch results yet",
                    "Run the batch inference to compare the model's categories against the reference labels.",
                )
            else:
                st.success(f"Batch inference complete for all {len(df_batch)} rows!")
                st.write("")

                has_ref = "Reference Category" in df_batch and (df_batch["Reference Category"] != "N/A").any()
                matches = int((df_batch["Calculated Category"] == df_batch["Reference Category"]).sum()) if has_ref else 0
                sc1, sc2, sc3 = st.columns(3, gap="medium")
                with sc1:
                    stat_card("Samples evaluated", f"{len(df_batch)}", "rows in the synthetic dataset")
                with sc2:
                    stat_card("Matches reference", f"{matches}" if has_ref else "N/A", "calculated = reference label")
                with sc3:
                    stat_card("Match rate", f"{100 * matches / len(df_batch):.1f}%" if has_ref else "N/A", "calculated vs reference")

                section_header("Distribution", "Calculated stress categories")
                st.bar_chart(df_batch["Calculated Category"].value_counts(), color="#3B82F6", height=300)

                with st.expander("View all results", expanded=False):
                    st.dataframe(df_batch, width="stretch")
        else:
            st.warning("Synthetic dataset file not found at data/synthetic_stress_data.csv.")

    footer_note(APP_METADATA["disclaimer"])


if __name__ == "__main__":
    main()
