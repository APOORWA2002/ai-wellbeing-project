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


# Black + electric-blue chart theme (matches ui/theme.py)
BG = "#111214"        # card background
BG_DEEP = "#0D0D0F"
TEXT = "#E5E7EB"
MUTED = "#8A8F98"
BORDER = "#2A2D33"
GRID = "#1D1F23"
BLUE = "#3B82F6"
BLUE_SOFT = "#93C5FD"
WHITE = "#FFFFFF"
RED = "#F87171"       # reserved for the High-stress zone only

# Ascending linguistic terms (low -> mid -> high) always use the same three line styles.
SERIES = [
    {"color": BLUE, "linestyle": "-"},
    {"color": WHITE, "linestyle": "-"},
    {"color": BLUE_SOFT, "linestyle": (0, (5, 3))},
]

# Kept for backwards compatibility with any code that imports PALETTE.
PALETTE = {
    "low": BLUE,
    "normal": WHITE,
    "moderate": WHITE,
    "marginal": WHITE,
    "prolonged": BLUE_SOFT,
    "inadequate": BLUE,
    "optimal": BLUE_SOFT,
    "medium": WHITE,
    "high": BLUE_SOFT,
    "marker": WHITE,
    "stress_marker": WHITE,
    "grid": GRID,
}


def style_figure(fig: plt.Figure, ax: plt.Axes) -> None:
    """Apply the dark card background to a figure/axis pair."""
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.tick_params(colors=MUTED, labelsize=8.5, length=3)


def style_legend(ax: plt.Axes, loc: str = "upper center", fontsize: float = 8.5, ncol: int = 1) -> None:
    """Place the legend below the plot so it never covers the curves."""
    leg = ax.legend(
        loc="upper center", bbox_to_anchor=(0.5, -0.27), ncol=ncol,
        frameon=True, facecolor=BG_DEEP, edgecolor=BORDER, fontsize=fontsize, labelcolor=TEXT,
    )
    leg.get_frame().set_linewidth(0.8)
    leg.get_frame().set_alpha(0.95)


def setup_plot_style(ax: plt.Axes, title: str, xlabel: str, xlim: tuple) -> None:
    """Apply clean minimalist dark styling to an axis."""
    style_figure(ax.figure, ax)
    ax.set_title(title, fontsize=11.5, fontweight="bold", pad=12, color=WHITE, loc="left")
    ax.set_xlabel(xlabel, fontsize=9.5, labelpad=8, color=MUTED)
    ax.set_ylabel("Membership Degree (\u03bc)", fontsize=9.5, labelpad=8, color=MUTED)
    ax.set_ylim(-0.05, 1.05)
    ax.set_xlim(xlim[0], xlim[1])
    ax.grid(True, linestyle="-", linewidth=0.6, alpha=1.0, color=GRID)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(BORDER)
    ax.spines["bottom"].set_color(BORDER)


def _marker(ax: plt.Axes, value: float, unit: str) -> None:
    ax.axvline(value, color=WHITE, linestyle="--", linewidth=1.6, label=f"Current: {value:.1f} {unit}")
    ax.scatter([value], [0.0], color=WHITE, s=46, zorder=5, edgecolors=BLUE, linewidths=1.6)


def plot_hrv_mf(current_val: Optional[float] = None) -> plt.Figure:
    """Generate plot of HRV membership functions with current value marker."""
    universes = create_fuzzy_universes()
    u = universes["hrv"]

    low_y = fuzz.trapmf(u, HRV_MF["low"])
    norm_y = fuzz.trimf(u, HRV_MF["normal"])
    high_y = fuzz.trapmf(u, HRV_MF["high"])

    fig, ax = plt.subplots(figsize=(7, 3.8), dpi=100)
    setup_plot_style(ax, "Heart Rate Variability (HRV) Membership Functions", "HRV (ms)", (20, 120))

    ax.plot(u, low_y, label="Low [20, 20, 35, 50] (Trapezoid)", **SERIES[0], linewidth=2.2)
    ax.plot(u, norm_y, label="Normal [35, 55, 75] (Triangle)", **SERIES[1], linewidth=2.2)
    ax.plot(u, high_y, label="High [60, 80, 120, 120] (Trapezoid)", **SERIES[2], linewidth=2.2)

    if current_val is not None:
        _marker(ax, current_val, "ms")

    style_legend(ax, ncol=2)
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

    ax.plot(u, short_y, label="Short [0, 0, 2, 5] (Trapezoid)", **SERIES[0], linewidth=2.2)
    ax.plot(u, mod_y, label="Moderate [3, 6, 9] (Triangle)", **SERIES[1], linewidth=2.2)
    ax.plot(u, pro_y, label="Prolonged [7, 11, 16, 16] (Trapezoid)", **SERIES[2], linewidth=2.2)

    if current_val is not None:
        _marker(ax, current_val, "h")

    style_legend(ax, ncol=2)
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

    ax.plot(u, inad_y, label="Inadequate [2, 2, 4, 5.5] (Trapezoid)", **SERIES[0], linewidth=2.2)
    ax.plot(u, marg_y, label="Marginal [4.5, 6, 7.5] (Triangle)", **SERIES[1], linewidth=2.2)
    ax.plot(u, opt_y, label="Optimal [6.5, 8, 10, 10] (Trapezoid)", **SERIES[2], linewidth=2.2)

    if current_val is not None:
        _marker(ax, current_val, "h")

    style_legend(ax, ncol=2)
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
    ax.plot(u, low_y, label="Low [0, 0, 40] (Triangle)", color=BLUE, linestyle=":", linewidth=1.8)
    ax.plot(u, med_y, label="Medium [25, 50, 75] (Triangle)", color=WHITE, linestyle=":", linewidth=1.8)
    ax.plot(u, high_y, label="High [60, 100, 100] (Triangle)", color=RED, linestyle=":", linewidth=1.8)

    # Shaded Aggregated consequent set if available
    if aggregated_set is not None and np.max(aggregated_set) > 0.001:
        ax.fill_between(u, 0, aggregated_set, facecolor=BLUE, alpha=0.35, label="Aggregated Fuzzy Output Set (Mamdani MAX)")
        ax.plot(u, aggregated_set, color=BLUE, linewidth=2.0)

    # Threshold zone indicators [0, 40) Low, [40, 70) Medium, [70, 100] High
    medium_min = STRESS_THRESHOLDS.get("medium_min", 40.0)
    high_min = STRESS_THRESHOLDS.get("high_min", 70.0)
    ax.axvspan(0, medium_min, color=BLUE, alpha=0.06, label=f"Low Category Zone (0 - {medium_min:.0f})")
    ax.axvspan(medium_min, high_min, color=WHITE, alpha=0.035, label=f"Medium Category Zone ({medium_min:.0f} - {high_min:.0f})")
    ax.axvspan(high_min, 100, color=RED, alpha=0.07, label=f"High Category Zone ({high_min:.0f} - 100)")

    # Centroid line marker
    if crisp_stress is not None:
        ax.axvline(crisp_stress, color=WHITE, linestyle="-", linewidth=2.4, label=f"Centroid Defuzzified Index: {crisp_stress:.1f}")
        ax.scatter([crisp_stress], [0.5], color=WHITE, s=70, zorder=6, edgecolors=BLUE, linewidths=2)

    style_legend(ax, fontsize=8.0, ncol=2)
    fig.tight_layout()
    return fig


def plot_architecture_pipeline() -> plt.Figure:
    """Render a publication-ready flow diagram representing the 8-Stage System Architecture."""
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=120)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 12)
    ax.set_ylim(3.0, 10)
    ax.axis("off")

    def draw_box(x, y, w, h, title, subtitle, highlight=False):
        rect = patches.FancyBboxPatch(
            (x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.25",
            facecolor="#0F1B33" if highlight else BG_DEEP,
            edgecolor=BLUE if highlight else BORDER, linewidth=1.8 if highlight else 1.2, zorder=3,
        )
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2 + 0.22, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color=WHITE, zorder=4)
        ax.text(x + w / 2, y + h / 2 - 0.24, subtitle, ha="center", va="center", fontsize=7.5, color=MUTED, zorder=4, linespacing=1.5)

    def draw_arrow(x1, y1, x2, y2, color=None):
        ax.annotate(
            "", xy=(x2, y2), xytext=(x1, y1),
            arrowprops=dict(facecolor=color or "#9CA3AF", edgecolor=color or "#9CA3AF", arrowstyle="-|>", lw=1.6, shrinkA=0, shrinkB=0),
            zorder=2,
        )

    # Row 1 (Top): Stages 1 to 4 (Left to Right)
    draw_box(0.5, 7.5, 2.2, 1.2, "1. User Input", "HRV, Screen, Sleep\n+ Context Flags")
    draw_box(3.4, 7.5, 2.1, 1.2, "2. Preprocessing", "Validation & Clamping\nBounds Verification")
    draw_box(6.2, 7.2, 2.5, 1.8, "3. AI Engine Layer", "3.1 Fuzzification (\u03bc)\n3.2 Mamdani Inference (Min)\n3.3 Centroid Defuzz (0-100)", highlight=True)
    draw_box(9.4, 7.5, 2.1, 1.2, "4. Recommendation", "Rule-Based Coping\nDecoupled Engine")

    draw_arrow(2.8, 8.1, 3.3, 8.1)
    draw_arrow(5.6, 8.1, 6.1, 8.1, BLUE)
    draw_arrow(8.8, 8.1, 9.3, 8.1, BLUE)
    ax.text(9.05, 8.42, "Stress\nCat.", ha="center", va="bottom", fontsize=6.8, color=BLUE_SOFT, zorder=4, linespacing=1.2)

    # Row 2 (Bottom): Stages 5 to 8 (Right to Left)
    draw_box(9.4, 4.0, 2.1, 1.2, "5. Coping Output", "Selected Coping Action\nTargeted Interventions")
    draw_box(6.2, 4.0, 2.5, 1.2, "6. Explanation", "Transparency & Active Rules\nFiring Strengths & Drivers")
    draw_box(3.4, 4.0, 2.1, 1.2, "7. Results Display", "Streamlit UI Dashboard\nGauges, Badges & Charts")
    draw_box(0.5, 4.0, 2.2, 1.2, "8. Re-evaluation", "Real-Time Feedback\nContinuous Iteration")

    draw_arrow(10.45, 7.4, 10.45, 5.3)
    draw_arrow(9.3, 4.6, 8.8, 4.6)
    draw_arrow(6.1, 4.6, 5.6, 4.6)
    draw_arrow(3.3, 4.6, 2.8, 4.6)

    # Feedback loop from Stage 8 back to Stage 1
    ax.annotate(
        "", xy=(1.6, 7.4), xytext=(1.6, 5.3),
        arrowprops=dict(facecolor=BLUE, edgecolor=BLUE, arrowstyle="-|>", lw=1.8, linestyle="--", shrinkA=0, shrinkB=0),
        zorder=2,
    )
    ax.text(1.85, 6.35, "Interactive\nRerun Loop", ha="left", va="center", fontsize=8.0, fontweight="bold", color=BLUE_SOFT, zorder=4, linespacing=1.3)

    # Title & Metadata
    ax.text(6.0, 9.78, "Eight-Stage System Pipeline Architecture", ha="center", va="center", fontsize=14, fontweight="bold", color=WHITE)
    ax.text(6.0, 9.4, "Mamdani Fuzzy Inference System & Decoupled Recommendation Engine", ha="center", va="center", fontsize=9.5, color=MUTED)
    ax.text(6.0, 3.35, "Course: Essentials of Artificial Intelligence (IT3182) | Group 12 | KDU Faculty of Computing", ha="center", va="center", fontsize=8.5, fontstyle="italic", color=MUTED)

    fig.tight_layout()
    return fig
