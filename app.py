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
from ui.dashboard import render_assessment_dashboard
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
        initial_sidebar_state="expanded",
    )

    # --------------------------------------------------------------------------
    # SIDEBAR: Project Info & Quick Presets
    # --------------------------------------------------------------------------
    with st.sidebar:
        st.markdown("## 🏥 System Overview")
        st.markdown(f"**Course:** {APP_METADATA['course']}")
        st.markdown(f"**Group:** {APP_METADATA['group']}")
        st.caption("General Sir John Kotelawala Defence University, Faculty of Computing")

        st.markdown("---")
        st.markdown("### ⚡ Quick Scenario Presets")
        st.caption("Click a scenario to preload representative physiological profiles:")

        if st.button("🔴 High Stress (Exam / Deadline)", use_container_width=True):
            st.session_state["hrv_val"] = 30.0
            st.session_state["screen_val"] = 14.0
            st.session_state["sleep_val"] = 3.5
            st.rerun()

        if st.button("🟡 Medium Stress (Average Workday)", use_container_width=True):
            st.session_state["hrv_val"] = 65.0
            st.session_state["screen_val"] = 7.0
            st.session_state["sleep_val"] = 6.0
            st.rerun()

        if st.button("🟢 Low Stress (Rest & Recovery)", use_container_width=True):
            st.session_state["hrv_val"] = 100.0
            st.session_state["screen_val"] = 2.0
            st.session_state["sleep_val"] = 9.0
            st.rerun()

        st.markdown("---")
        st.markdown("### ⚙️ Engine Specifications")
        st.markdown(
            """
            - **Fuzzy Model:** Mamdani-Type FIS
            - **Defuzzification:** Centroid Method
            - **Rule Base:** 27 Core + 4 Supplementary
            - **Inference Library:** `scikit-fuzzy`
            - **Architecture:** Decoupled 8-Stage Pipeline
            """
        )

        st.markdown("---")
        st.markdown("### ⚠️ Academic Disclaimer")
        st.caption(APP_METADATA["disclaimer"])

    # --------------------------------------------------------------------------
    # PAGE HEADER
    # --------------------------------------------------------------------------
    st.title("🧠 " + APP_METADATA["title"])
    st.markdown(f"#### *{APP_METADATA['subtitle']}*")
    st.markdown(
        f"""
        <div style="background-color: #f1f3f5; border-left: 4px solid #495057; padding: 10px 16px; border-radius: 4px; margin-bottom: 20px;">
            <span style="font-size: 0.88rem; color: #495057;">
                <strong>Academic Prototype:</strong> {APP_METADATA['course']} &bull; {APP_METADATA['group']} &bull; KDU Faculty of Computing<br>
                <em>{APP_METADATA['disclaimer']}</em>
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # --------------------------------------------------------------------------
    # NAVIGATION TABS
    # --------------------------------------------------------------------------
    tab_dashboard, tab_visuals, tab_arch, tab_dataset = st.tabs([
        "🫀 Real-Time Assessment",
        "📈 Fuzzy Membership Functions",
        "🏗️ System Architecture (8 Stages)",
        "📁 Synthetic Dataset & Batch Evaluation",
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
        st.markdown("### 📈 Fuzzy Set Visualizations & Dynamic Membership Markers")
        st.caption("Inspect the mathematical shape of each linguistic term across the universe of discourse. Vertical markers indicate your current active values.")

        # Get latest active inputs from session state
        curr_hrv = st.session_state.get("slider_hrv", UNIVERSE_CONFIG["hrv"]["default"])
        curr_screen = st.session_state.get("slider_screen", UNIVERSE_CONFIG["screen_time"]["default"])
        curr_sleep = st.session_state.get("slider_sleep", UNIVERSE_CONFIG["sleep_duration"]["default"])

        last_inf = st.session_state.get("last_inference")
        curr_stress = last_inf.crisp_stress_index if last_inf else None
        agg_set = last_inf.aggregated_fuzzy_set if last_inf else None

        col_v1, col_v2 = st.columns(2)
        with col_v1:
            st.pyplot(plot_hrv_mf(curr_hrv), use_container_width=True)
            st.pyplot(plot_sleep_mf(curr_sleep), use_container_width=True)

        with col_v2:
            st.pyplot(plot_screen_time_mf(curr_screen), use_container_width=True)
            st.pyplot(plot_stress_output_mf(curr_stress, agg_set), use_container_width=True)

        st.info(
            "💡 **Note on Centroid Defuzzification:** The shaded blue area in the Stress Index chart represents "
            "the aggregated consequent fuzzy set (Mamdani MAX operator applied across all active rule implications). "
            "The red vertical marker is the exact center of gravity (centroid) calculated across this continuous shape."
        )

    # --------------------------------------------------------------------------
    # TAB 3: System Pipeline & Architecture
    # --------------------------------------------------------------------------
    with tab_arch:
        st.markdown("### 🏗️ Eight-Stage End-to-End System Pipeline")
        st.caption("Visual representation of the decoupled software architecture, designed for university academic evaluation.")

        st.pyplot(plot_architecture_pipeline(), use_container_width=True)

        st.markdown("---")
        st.markdown("#### Detailed Stage Walkthrough")
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
                   - **3.3 Centroid Defuzzification:** Computes center-of-gravity crisp Stress Index ($0–100$).
                4. **Rule-Based Recommendation Engine:**
                   - Decoupled component taking the stress category and contextual flags.
                   - Strictly preserves stress category; refines action based on time and setting.
                """
            )

        with col_s2:
            st.markdown(
                """
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
        st.markdown("### 📁 Synthetic Dataset & Batch Model Validation")
        st.caption("Demonstration of model inference across the input space using the synthetic test dataset.")

        dataset_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_stress_data.csv")

        if os.path.exists(dataset_path):
            df_synthetic = pd.read_csv(dataset_path, comment="#")
            st.markdown(f"**Loaded {len(df_synthetic)} synthetic simulation samples.**")

            st.dataframe(df_synthetic.head(15), use_container_width=True)

            if st.button("⚡ Run Full Batch Inference on Dataset", type="primary"):
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

                    df_batch = pd.DataFrame(results)
                    st.success(f"Batch inference complete for all {len(df_batch)} rows!")
                    st.dataframe(df_batch, use_container_width=True)

                    # Distribution chart
                    cat_counts = df_batch["Calculated Category"].value_counts()
                    st.bar_chart(cat_counts)
        else:
            st.warning("Synthetic dataset file not found at data/synthetic_stress_data.csv.")


if __name__ == "__main__":
    main()
