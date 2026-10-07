"""Matplotlib visualization module for Membership Functions and System Architecture.

Generates publication-quality charts for the Streamlit dashboard:
- Membership functions for HRV, Screen Time, Sleep Duration, and Stress Index
- Dynamic vertical marker indicating the user's current inputs and defuzzified output
- Shaded aggregated consequent fuzzy set
- Comprehensive visual diagram of the eight-stage pipeline
"""

from typing import Optional, Dict
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for web/server safety
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import skfuzzy as fuzz

from config.fuzzy_config import (
    UNIVERSE_CONFIG,
    HRV_MF,
    SCREEN_TIME_MF,
    SLEEP_MF,
    STRESS_MF,
    STRESS_THRESHOLDS,
)
from fuzzy_engine.membership import create_fuzzy_universes


# Modern color palette for academic presentations
PALETTE = {
    "low": "#2b8a3e",       # Green
    "normal": "#1971c2",    # Blue
    "moderate": "#e67700",  # Amber/Orange
    "marginal": "#d9480f",  # Orange-Red
    "prolonged": "#c92a2a", # Red
    "inadequate": "#a61e4d",# Dark Pink/Red
    "optimal": "#0ca678",   # Teal
    "medium": "#f59f00",    # Yellow/Amber
    "high": "#e03131",      # Crimson
    "marker": "#1c7ed6",    # Marker blue
    "stress_marker": "#d6336c", # Accent pink
    "grid": "#e9ecef",
}


def setup_plot_style(ax: plt.Axes, title: str, xlabel: str, xlim: tuple) -> None:
    """Apply clean minimalist styling to an axis."""
    ax.set_title(title, fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel(xlabel, fontsize=10, labelpad=8)
    ax.set_ylabel("Membership Degree (μ)", fontsize=10, labelpad=8)
    ax.set_ylim(-0.05, 1.05)
    ax.set_xlim(xlim[0], xlim[1])
    ax.grid(True, linestyle="--", alpha=0.6, color=PALETTE["grid"])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#868e96")
    ax.spines["bottom"].set_color("#868e96")


def plot_hrv_mf(current_val: Optional[float] = None) -> plt.Figure:
    """Generate plot of HRV membership functions with current value marker."""
    universes = create_fuzzy_universes()
    u = universes["hrv"]

    low_y = fuzz.trapmf(u, HRV_MF["low"])
    norm_y = fuzz.trimf(u, HRV_MF["normal"])
    high_y = fuzz.trapmf(u, HRV_MF["high"])

    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=100)
    setup_plot_style(ax, "Heart Rate Variability (HRV) Membership Functions", "HRV (ms)", (20, 120))

    ax.plot(u, low_y, label="Low [20, 20, 35, 50] (Trapezoid)", color=PALETTE["low"], linewidth=2.5)
    ax.plot(u, norm_y, label="Normal [35, 55, 75] (Triangle)", color=PALETTE["normal"], linewidth=2.5)
    ax.plot(u, high_y, label="High [60, 80, 120, 120] (Trapezoid)", color=PALETTE["optimal"], linewidth=2.5)

    if current_val is not None:
        ax.axvline(current_val, color="#e03131", linestyle="--", linewidth=2.2, label=f"Current: {current_val:.1f} ms")
        ax.scatter([current_val], [0.0], color="#e03131", s=60, zorder=5)

    ax.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#ced4da", fontsize=8.5)
    fig.tight_layout()
    return fig


def plot_screen_time_mf(current_val: Optional[float] = None) -> plt.Figure:
    """Generate plot of Daily Screen Time membership functions with current value marker."""
    universes = create_fuzzy_universes()
    u = universes["screen_time"]

    short_y = fuzz.trapmf(u, SCREEN_TIME_MF["short"])
    mod_y = fuzz.trimf(u, SCREEN_TIME_MF["moderate"])
    pro_y = fuzz.trapmf(u, SCREEN_TIME_MF["prolonged"])

    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=100)
    setup_plot_style(ax, "Daily Screen Time Membership Functions", "Screen Time (Hours)", (0, 16))

    ax.plot(u, short_y, label="Short [0, 0, 2, 5] (Trapezoid)", color=PALETTE["optimal"], linewidth=2.5)
    ax.plot(u, mod_y, label="Moderate [3, 6, 9] (Triangle)", color=PALETTE["moderate"], linewidth=2.5)
    ax.plot(u, pro_y, label="Prolonged [7, 11, 16, 16] (Trapezoid)", color=PALETTE["prolonged"], linewidth=2.5)

    if current_val is not None:
        ax.axvline(current_val, color="#e03131", linestyle="--", linewidth=2.2, label=f"Current: {current_val:.1f} h")
        ax.scatter([current_val], [0.0], color="#e03131", s=60, zorder=5)

    ax.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#ced4da", fontsize=8.5)
    fig.tight_layout()
    return fig


def plot_sleep_mf(current_val: Optional[float] = None) -> plt.Figure:
    """Generate plot of Sleep Duration membership functions with current value marker."""
    universes = create_fuzzy_universes()
    u = universes["sleep_duration"]

    inad_y = fuzz.trapmf(u, SLEEP_MF["inadequate"])
    marg_y = fuzz.trimf(u, SLEEP_MF["marginal"])
    opt_y = fuzz.trapmf(u, SLEEP_MF["optimal"])

    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=100)
    setup_plot_style(ax, "Sleep Duration Membership Functions", "Sleep Duration (Hours)", (2, 10))

    ax.plot(u, inad_y, label="Inadequate [2, 2, 4, 5.5] (Trapezoid)", color=PALETTE["inadequate"], linewidth=2.5)
    ax.plot(u, marg_y, label="Marginal [4.5, 6, 7.5] (Triangle)", color=PALETTE["marginal"], linewidth=2.5)
    ax.plot(u, opt_y, label="Optimal [6.5, 8, 10, 10] (Trapezoid)", color=PALETTE["optimal"], linewidth=2.5)

    if current_val is not None:
        ax.axvline(current_val, color="#e03131", linestyle="--", linewidth=2.2, label=f"Current: {current_val:.1f} h")
        ax.scatter([current_val], [0.0], color="#e03131", s=60, zorder=5)

    ax.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#ced4da", fontsize=8.5)
    fig.tight_layout()
    return fig


def plot_stress_output_mf(
    crisp_stress: Optional[float] = None,
    aggregated_set: Optional[np.ndarray] = None
) -> plt.Figure:
    """Generate plot of Stress Index output MFs, aggregated fuzzy set, and centroid defuzzification."""
    universes = create_fuzzy_universes()
    u = universes["stress_index"]

    low_y = fuzz.trimf(u, STRESS_MF["low"])
    med_y = fuzz.trimf(u, STRESS_MF["medium"])
    high_y = fuzz.trimf(u, STRESS_MF["high"])

    fig, ax = plt.subplots(figsize=(8, 4.2), dpi=100)
    setup_plot_style(ax, "Stress Index Consequent & Aggregated Defuzzification", "Stress Index (0 - 100)", (0, 100))

    # Base linguistic terms
    ax.plot(u, low_y, label="Low [0, 0, 40] (Triangle)", color=PALETTE["low"], linestyle=":", linewidth=2)
    ax.plot(u, med_y, label="Medium [25, 50, 75] (Triangle)", color=PALETTE["medium"], linestyle=":", linewidth=2)
    ax.plot(u, high_y, label="High [60, 100, 100] (Triangle)", color=PALETTE["high"], linestyle=":", linewidth=2)

    # Shaded Aggregated consequent set if available
    if aggregated_set is not None and np.max(aggregated_set) > 0.001:
        ax.fill_between(u, 0, aggregated_set, facecolor="#74c0fc", alpha=0.45, label="Aggregated Fuzzy Output Set (Mamdani MAX)")
        ax.plot(u, aggregated_set, color="#1c7ed6", linewidth=2.0)

    # Threshold zone indicators [0, 40) Low, [40, 70) Medium, [70, 100] High
    medium_min = STRESS_THRESHOLDS.get("medium_min", 40.0)
    high_min = STRESS_THRESHOLDS.get("high_min", 70.0)
    ax.axvspan(0, medium_min, color="#2b8a3e", alpha=0.06, label=f"Low Category Zone (0 - {medium_min:.0f})")
    ax.axvspan(medium_min, high_min, color="#f59f00", alpha=0.06, label=f"Medium Category Zone ({medium_min:.0f} - {high_min:.0f})")
    ax.axvspan(high_min, 100, color="#e03131", alpha=0.06, label=f"High Category Zone ({high_min:.0f} - 100)")

    # Centroid line marker
    if crisp_stress is not None:
        ax.axvline(crisp_stress, color="#c92a2a", linestyle="-", linewidth=2.8, label=f"Centroid Defuzzified Index: {crisp_stress:.1f}")
        ax.scatter([crisp_stress], [0.5], color="#c92a2a", s=80, zorder=6)

    ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="#ced4da", fontsize=8.0)
    fig.tight_layout()
    return fig


def plot_architecture_pipeline() -> plt.Figure:
    """Render a publication-ready flow diagram representing the 8-Stage System Architecture."""
    fig, ax = plt.subplots(figsize=(10.5, 6.5), dpi=120)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis("off")

    def draw_box(x, y, w, h, title, subtitle, color, border_color="#343a40"):
        rect = patches.FancyBboxPatch(
            (x, y), w, h, boxstyle="round,pad=0.2,rounding_size=0.3",
            facecolor=color, edgecolor=border_color, linewidth=1.5, zorder=3
        )
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2 + 0.22, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color="#212529", zorder=4)
        ax.text(x + w / 2, y + h / 2 - 0.22, subtitle, ha="center", va="center", fontsize=7.5, color="#495057", zorder=4)

    def draw_arrow(x1, y1, x2, y2, label=""):
        ax.annotate(
            label, xy=(x2, y2), xytext=(x1, y1),
            arrowprops=dict(facecolor="#495057", edgecolor="#495057", arrowstyle="-|>", lw=1.8, shrinkA=4, shrinkB=4),
            ha="center", va="center", fontsize=7.5, color="#343a40", zorder=2
        )

    # Row 1 (Top): Stages 1 to 4 (Left to Right)
    draw_box(0.8, 7.5, 2.3, 1.2, "1. User Input", "HRV, Screen, Sleep\n+ Context Flags", "#e7f5ff", "#339af0")
    draw_box(3.6, 7.5, 2.2, 1.2, "2. Preprocessing", "Validation & Clamping\nBounds Verification", "#e3fafc", "#22b8cf")
    draw_box(6.3, 7.2, 2.5, 1.8, "3. AI Engine Layer", "3.1 Fuzzification (μ)\n3.2 Mamdani Inference (Min)\n3.3 Centroid Defuzz (0-100)", "#fff3bf", "#fab005")
    draw_box(9.3, 7.5, 2.2, 1.2, "4. Recommendation", "Rule-Based Coping\nDecoupled Engine", "#eebefa", "#cc5de8")

    draw_arrow(3.1, 8.1, 3.6, 8.1)
    draw_arrow(5.8, 8.1, 6.3, 8.1)
    draw_arrow(8.8, 8.1, 9.3, 8.1, "Stress Cat.")

    # Row 2 (Bottom): Stages 5 to 8 (Right to Left)
    draw_box(9.3, 4.0, 2.2, 1.2, "5. Coping Output", "Selected Coping Action\nTargeted Interventions", "#d3f9d8", "#40c057")
    draw_box(6.3, 4.0, 2.5, 1.2, "6. Explanation", "Transparency & Active Rules\nFiring Strengths & Drivers", "#ffe8cc", "#fd7e14")
    draw_box(3.6, 4.0, 2.2, 1.2, "7. Results Display", "Streamlit UI Dashboard\nGauges, Badges & Charts", "#d0ebff", "#1971c2")
    draw_box(0.8, 4.0, 2.3, 1.2, "8. Re-evaluation", "Real-Time Feedback\nContinuous Iteration", "#f1f3f5", "#868e96")

    draw_arrow(10.4, 7.5, 10.4, 5.2)
    draw_arrow(9.3, 4.6, 8.8, 4.6)
    draw_arrow(6.3, 4.6, 5.8, 4.6)
    draw_arrow(3.6, 4.6, 3.1, 4.6)

    # Feedback loop from Stage 8 back to Stage 1
    ax.annotate(
        "Interactive Rerun Loop",
        xy=(1.95, 7.5), xytext=(1.95, 5.2),
        arrowprops=dict(facecolor="#1c7ed6", edgecolor="#1c7ed6", arrowstyle="-|>", lw=2.0, linestyle="--", shrinkA=4, shrinkB=4),
        ha="center", va="center", fontsize=8.0, fontweight="bold", color="#1c7ed6", zorder=2
    )

    # Title & Metadata
    ax.text(6.0, 9.6, "Eight-Stage System Pipeline Architecture", ha="center", va="center", fontsize=14, fontweight="bold", color="#212529")
    ax.text(6.0, 9.2, "Mamdani Fuzzy Inference System & Decoupled Recommendation Engine", ha="center", va="center", fontsize=9.5, color="#6c757d")
    ax.text(6.0, 0.5, "Course: Essentials of Artificial Intelligence (IT3182) | Group 12 | KDU Faculty of Computing", ha="center", va="center", fontsize=8.5, fontstyle="italic", color="#868e96")

    fig.tight_layout()
    return fig
