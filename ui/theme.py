"""Visual theme layer: Black + Electric Blue, minimal futuristic design system.

This module contains ONLY presentation code (CSS, icons, small HTML builders).
It does not touch the fuzzy engine, recommendation engine, config values, or
any application logic.

Fonts
-----
- Poppins  : main UI font (body, navigation, buttons, forms)
- Orbitron : page headings and important numbers
- Pirulen  : brand text and small futuristic labels (drop the font file into
             ``assets/fonts/``; falls back to Orbitron if it is missing)
"""

from __future__ import annotations

import base64
import html
import re
from pathlib import Path
from typing import Dict

import streamlit as st

# ==============================================================================
# DESIGN TOKENS
# ==============================================================================
BLUE = "#3B82F6"
BLUE_STRONG = "#2563EB"
BLUE_SOFT = "#93C5FD"
RED = "#F87171"  # used ONLY for the High-stress state and validation errors

# Category -> accent colour (kept in the black + blue family; red only for High)
CATEGORY_STYLE: Dict[str, Dict[str, str]] = {
    "Low": {"color": BLUE, "tint": "rgba(59,130,246,0.10)"},
    "Medium": {"color": "#BFDBFE", "tint": "rgba(191,219,254,0.07)"},
    "High": {"color": RED, "tint": "rgba(248,113,113,0.09)"},
}

# ==============================================================================
# LUCIDE ICONS (single consistent icon system, inline SVG, 24x24 viewBox)
# ==============================================================================
_LUCIDE: Dict[str, str] = {
    "activity": '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    "chart-line": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
    "layers": '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    "zap": '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    "info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    "moon": '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "sliders": '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
}


def icon(name: str, size: int = 16, stroke: float = 1.8, color: str = "currentColor") -> str:
    """Return an inline Lucide SVG string."""
    inner = _LUCIDE[name]
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{stroke}" '
        f'stroke-linecap="round" stroke-linejoin="round" class="lucide">{inner}</svg>'
    )


def _mask(name: str, stroke: float = 1.8) -> str:
    """CSS ``url()`` of a Lucide icon, used with ``mask-image`` so it takes the text colour."""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
        f'stroke="black" stroke-width="{stroke}" stroke-linecap="round" '
        f'stroke-linejoin="round">{_LUCIDE[name]}</svg>'
    )
    encoded = base64.b64encode(svg.encode()).decode()
    return f'url("data:image/svg+xml;base64,{encoded}")'


def _h(markup: str) -> str:
    """Collapse HTML onto one line so Markdown never treats it as a code block."""
    return re.sub(r"\n\s*", "", markup).strip()


# ==============================================================================
# PIRULEN (optional, embedded from assets/fonts if the file exists)
# ==============================================================================
_FONT_DIR = Path(__file__).resolve().parent.parent / "assets" / "fonts"
_FONT_MIME = {
    ".woff2": ("font/woff2", "woff2"),
    ".woff": ("font/woff", "woff"),
    ".otf": ("font/otf", "opentype"),
    ".ttf": ("font/ttf", "truetype"),
}


@st.cache_resource(show_spinner=False)
def _pirulen_font_face() -> str:
    """Return an @font-face rule for Pirulen if a font file is present, else ''."""
    if not _FONT_DIR.exists():
        return ""
    for ext in (".woff2", ".woff", ".otf", ".ttf"):
        for f in _FONT_DIR.iterdir():
            if f.name.lower().startswith("pirulen") and f.suffix.lower() == ext:
                mime, fmt = _FONT_MIME[ext]
                data = base64.b64encode(f.read_bytes()).decode()
                return (
                    "@font-face{font-family:'Pirulen';font-display:swap;"
                    f"src:url(data:{mime};base64,{data}) format('{fmt}');}}"
                )
    return ""


# ==============================================================================
# GLOBAL CSS
# ==============================================================================
_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
__PIRULEN__

:root {
  --bg: #050505;
  --bg-2: #0A0A0A;
  --bg-3: #0D0D0F;
  --card: #111214;
  --border: #1D1F23;
  --border-strong: #2A2D33;
  --text: #FFFFFF;
  --text-2: #C7CAD1;
  --muted: #9AA0AA;
  --blue: #3B82F6;
  --blue-strong: #2563EB;
  --blue-soft: #93C5FD;
  --blue-tint: rgba(59,130,246,0.10);
  --glow: 0 0 0 1px rgba(59,130,246,0.55), 0 0 22px rgba(59,130,246,0.28);
  --font-ui: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-tech: 'Orbitron', 'Poppins', sans-serif;
  --font-brand: 'Pirulen', 'Orbitron', 'Poppins', sans-serif;
  --radius: 10px;
  --ease: cubic-bezier(.2,.7,.2,1);
}

/* ---------- Base ---------- */
html, body, .stApp {
  font-family: var(--font-ui);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
/* Streamlit sets its own font on many elements; force Poppins there (icons + code are spared) */
.stApp :is(p, li, label, button, input, textarea, select, div, span, td, th, summary, h1, h2, h3, h4, h5, h6, a):not([data-testid="stIconMaterial"]):not(pre *):not(code):not(svg *) {
  font-family: var(--font-ui);
}
.stApp {
  background:
    radial-gradient(900px 420px at 50% -120px, rgba(37,99,235,0.16), transparent 70%),
    linear-gradient(var(--bg), var(--bg));
}
.stApp::before {               /* faint grid, fades out downward */
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse 70% 38% at 50% 0%, #000 20%, transparent 75%);
          mask-image: radial-gradient(ellipse 70% 38% at 50% 0%, #000 20%, transparent 75%);
}
[data-testid="stHeader"] { background: transparent; }
[data-testid="stAppDeployButton"], [data-testid="stDecoration"] { display: none; }
[data-testid="stElementContainer"]:has(> [data-testid="stMarkdown"] style) { display: none; }

.block-container {
  max-width: 1180px;
  padding: 3.2rem 2rem 5rem;
  animation: tw-fade .5s var(--ease) both;
}
p, li, label, span, div { letter-spacing: 0; }
a { color: var(--blue); text-decoration: none; }
a:hover { color: var(--blue-soft); }
hr { border: none; border-top: 1px solid var(--border); margin: 1.1rem 0 .9rem; }
::selection { background: rgba(59,130,246,0.4); }

h1, h2, h3, h4, h5 { font-family: var(--font-ui); font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
[data-testid="stMarkdownContainer"] h4, h4 { font-size: 1.02rem !important; margin-top: .6rem; }
[data-testid="stMarkdownContainer"] h5, h5 { font-size: .9rem !important; color: var(--text-2); }
[data-testid="stMarkdownContainer"] p, [data-testid="stMarkdownContainer"] li { color: var(--text-2); line-height: 1.65; font-size: .93rem; }
[data-testid="stMarkdownContainer"] strong { color: var(--text); font-weight: 600; }
[data-testid="stCaptionContainer"], [data-testid="stCaptionContainer"] p { color: var(--muted) !important; font-size: .82rem; line-height: 1.55; }
code { font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace; background: var(--blue-tint); color: var(--blue-soft); border-radius: 5px; padding: .1em .4em; }

/* ---------- Motion ---------- */
@keyframes tw-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes tw-up   { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
[data-baseweb="tab-panel"], [role="tabpanel"] { animation: tw-up .38s var(--ease) both; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

/* ---------- Hero ---------- */
.tw-hero { margin-bottom: 1.7rem; }
.tw-eyebrow {
  font-family: var(--font-brand) !important; font-size: .62rem; letter-spacing: .22em; text-transform: uppercase;
  color: var(--blue); display: flex; align-items: center; gap: .6rem;
}
.tw-eyebrow::before { content: ""; width: 22px; height: 1px; background: var(--blue); }
.tw-hero h1 {
  font-family: var(--font-tech) !important; font-weight: 600; font-size: clamp(1.45rem, 3.3vw, 2.3rem);
  line-height: 1.22; letter-spacing: .005em; margin: .9rem 0 .7rem; padding: 0; max-width: 24ch;
}
.tw-hero .tw-sub { font-size: clamp(.9rem, 1.5vw, 1.05rem); color: var(--text-2); margin: 0 0 1.3rem; font-weight: 300; }
.tw-notice {
  display: flex; gap: .7rem; align-items: flex-start; padding: .75rem 1rem; max-width: 780px;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius);
  font-size: .78rem; color: var(--muted); line-height: 1.55;
}
.tw-notice svg { flex: none; margin-top: 2px; color: var(--blue); }
.tw-notice b { color: var(--text-2); font-weight: 500; }

/* ---------- Section headers ---------- */
.tw-section { margin: 3rem 0 1.1rem; }
[role="tabpanel"] > div > [data-testid="stVerticalBlock"] > [data-testid="stElementContainer"]:first-child .tw-section, [data-baseweb="tab-panel"] [data-testid="stElementContainer"]:first-child .tw-section { margin-top: 1.4rem; }
.tw-section .tw-label {
  font-family: var(--font-brand) !important; font-size: .58rem; letter-spacing: .22em; text-transform: uppercase; color: var(--blue);
  display: flex; align-items: center; gap: .5rem; margin-bottom: .45rem;
}
.tw-section h2, .tw-section h3 { font-family: var(--font-ui); font-size: 1.28rem; font-weight: 600; margin: 0; padding: 0; color: var(--text); }
.tw-section p { margin: .3rem 0 0; color: var(--muted); font-size: .84rem; max-width: 70ch; }
.tw-mini { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 500; margin: .2rem 0 .1rem; display:block; }

/* ---------- Cards ---------- */
[data-testid="stVerticalBlockBorderWrapper"]:has(> div > [data-testid="stVerticalBlock"]) {
  border-radius: var(--radius);
}
div[data-testid="stVerticalBlockBorderWrapper"][class*="st-"] > div { border-radius: var(--radius); }
[data-testid="stVerticalBlockBorderWrapper"], .st-key-input_card {
  background: var(--card); border-color: var(--border) !important;
  box-shadow: 0 8px 28px rgba(0,0,0,0.35);
}
.st-key-input_card { border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem 1.7rem 1.6rem; }
.st-key-input_card [data-testid="stCaptionContainer"] p { font-size: .76rem; margin-top: -.2rem; }
.tw-card {
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 1.35rem 1.5rem; box-shadow: 0 8px 28px rgba(0,0,0,0.35);
  transition: border-color .2s var(--ease), transform .2s var(--ease), box-shadow .2s var(--ease);
}
.tw-card:hover { border-color: rgba(59,130,246,0.45); transform: translateY(-1px); box-shadow: 0 12px 34px rgba(0,0,0,0.45); }

/* ---------- Result cards ---------- */
.tw-score { height: 100%; }
.tw-score .tw-k { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
.tw-score .tw-num { font-family: var(--font-tech) !important; font-weight: 600; font-size: clamp(2.2rem, 5vw, 3rem); line-height: 1.1; margin: .5rem 0 .9rem; color: var(--text); }
.tw-score .tw-num small { font-size: .42em; color: var(--muted); font-weight: 500; margin-left: .35rem; }
.tw-gauge { position: relative; height: 6px; border-radius: 6px; display: flex; gap: 2px; overflow: visible; }
.tw-gauge i { display: block; height: 100%; }
.tw-gauge i:first-child { border-radius: 6px 0 0 6px; } .tw-gauge i:nth-child(3) { border-radius: 0 6px 6px 0; }
.tw-gauge .tw-pin {
  position: absolute; top: -5px; width: 3px; height: 16px; margin-left: -1.5px; border-radius: 3px; background: #fff;
  box-shadow: 0 0 12px rgba(255,255,255,.65); transition: left .5s var(--ease);
}
.tw-scale { position: relative; height: 1rem; margin-top: .55rem; font-size: .66rem; color: var(--muted); }
.tw-scale span { position: absolute; transform: translateX(-50%); }
.tw-scale span:first-child { transform: none; } .tw-scale span:last-child { transform: translateX(-100%); }

.tw-status { height: 100%; display: flex; flex-direction: column; justify-content: center; border-left: 3px solid var(--c); background-image: linear-gradient(90deg, var(--t), transparent 70%); }
.tw-status .tw-k { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
.tw-status .tw-state { font-family: var(--font-tech) !important; font-weight: 600; font-size: clamp(1.1rem, 2.4vw, 1.5rem); color: var(--c); letter-spacing: .06em; margin: .5rem 0 .45rem; display: flex; align-items: center; gap: .6rem; }
.tw-status .tw-state::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 12px var(--c); }
.tw-status p { margin: 0; color: var(--text-2); font-size: .92rem; line-height: 1.55; }

.tw-rec .tw-top { display: flex; justify-content: space-between; align-items: flex-start; gap: .8rem; flex-wrap: wrap; }
.tw-rec .tw-title { font-size: 1.08rem; font-weight: 600; color: var(--text); line-height: 1.35; }
.tw-chip { display: inline-flex; align-items: center; gap: .35rem; background: var(--blue-tint); color: var(--blue-soft); border: 1px solid rgba(59,130,246,.3); font-weight: 500; font-size: .76rem; padding: .22rem .65rem; border-radius: 999px; white-space: nowrap; }
.tw-rec p { color: var(--text-2); font-size: .92rem; line-height: 1.6; margin: .8rem 0 0; }
.tw-why { margin-top: 1rem; padding: .8rem 1rem; background: var(--bg-3); border: 1px solid var(--border); border-radius: 8px; }
.tw-why b { display: block; font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 500; margin-bottom: .3rem; }
.tw-why span { font-size: .85rem; color: var(--muted); line-height: 1.55; }

.tw-empty { text-align: center; padding: 2.6rem 1.2rem; border-style: dashed; }
.tw-empty:hover { transform: none; }
.tw-empty .tw-ico { width: 42px; height: 42px; margin: 0 auto .9rem; display: grid; place-items: center; border-radius: 12px; background: var(--blue-tint); color: var(--blue); }
.tw-empty b { display: block; font-weight: 600; color: var(--text); margin-bottom: .25rem; }
.tw-empty span { color: var(--muted); font-size: .86rem; }

/* ---------- Navigation (tabs) : works with baseweb (older) and react-aria (newer) Streamlit ---------- */
[role="tablist"] { gap: .2rem; border-bottom: 1px solid var(--border); background: transparent; overflow-x: auto; scrollbar-width: none; position: relative; }
[role="tablist"]::-webkit-scrollbar { display: none; }
[data-baseweb="tab-border"] { background: transparent !important; }
[data-baseweb="tab-highlight"] { background: var(--blue) !important; height: 2px !important; box-shadow: 0 0 12px rgba(59,130,246,.7); }
.react-aria-SelectionIndicator { background: var(--blue) !important; height: 2px !important; box-shadow: 0 0 12px rgba(59,130,246,.7); }
[role="tab"] {
  font-family: var(--font-ui); background: transparent; color: var(--muted); padding: .7rem .95rem; height: auto; cursor: pointer;
  display: inline-flex; align-items: center; gap: .5rem; border-radius: 8px 8px 0 0; transition: color .18s var(--ease), background .18s var(--ease);
}
[role="tab"] p, [role="tab"] [data-testid="stMarkdownContainer"] p { font-family: var(--font-ui); font-size: .84rem !important; font-weight: 500; color: inherit !important; white-space: nowrap; margin: 0; }
[role="tab"]::before { content: ""; width: 15px; height: 15px; background: currentColor; -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; flex: none; }
[role="tab"]:hover { color: var(--text); background: rgba(255,255,255,0.03); }
[role="tab"][aria-selected="true"] { color: var(--blue) !important; }
[role="tab"]:nth-of-type(1)::before, [role="tablist"] > [role="tab"]:nth-child(1)::before { -webkit-mask-image: __I_ACT__; mask-image: __I_ACT__; }
[role="tab"]:nth-of-type(2)::before, [role="tablist"] > [role="tab"]:nth-child(2)::before { -webkit-mask-image: __I_CHART__; mask-image: __I_CHART__; }
[role="tab"]:nth-of-type(3)::before, [role="tablist"] > [role="tab"]:nth-child(3)::before { -webkit-mask-image: __I_LAYERS__; mask-image: __I_LAYERS__; }
[role="tab"]:nth-of-type(4)::before, [role="tablist"] > [role="tab"]:nth-child(4)::before { -webkit-mask-image: __I_DB__; mask-image: __I_DB__; }
[data-baseweb="tab-panel"], [role="tabpanel"] { padding-top: 1rem; }

/* ---------- Sidebar ---------- */
[data-testid="stSidebar"] { background: var(--bg-2); border-right: 1px solid var(--border); }
[data-testid="stSidebar"] > div:first-child { padding-top: .4rem; }
[data-testid="stSidebarContent"] { padding: 0 .4rem; }
.tw-brand { display: flex; align-items: center; gap: .7rem; padding: .3rem 0 1.1rem; }
.tw-brand .tw-logo { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; color: #fff; background: linear-gradient(140deg, var(--blue), var(--blue-strong)); box-shadow: 0 0 18px rgba(37,99,235,.45); }
.tw-brand .tw-name { font-family: var(--font-brand) !important; font-size: .78rem; letter-spacing: .14em; line-height: 1.25; color: #fff; text-transform: uppercase; }
.tw-brand .tw-name small { display: block; font-family: var(--font-ui); font-size: .62rem; letter-spacing: .06em; color: var(--muted); text-transform: none; margin-top: 2px; }
.tw-side-label { font-family: var(--font-brand) !important; font-size: .55rem; letter-spacing: .22em; text-transform: uppercase; color: var(--blue); margin: 1.5rem 0 .6rem; display: block; }
.tw-kv { display: flex; justify-content: space-between; gap: .8rem; padding: .5rem 0; border-bottom: 1px solid var(--border); font-size: .78rem; }
.tw-kv:last-child { border-bottom: none; }
.tw-kv-stacked { flex-direction: column; gap: .15rem; }
.tw-kv.tw-kv-stacked span:last-child { text-align: left; }
.tw-kv span:first-child { color: var(--muted); } .tw-kv span:last-child { color: var(--text-2); text-align: right; font-weight: 500; }
.tw-side-note { font-size: .74rem; color: var(--muted); line-height: 1.55; }
[data-testid="stSidebar"] [data-testid="stCaptionContainer"] p { font-size: .74rem; }

/* preset buttons get a Lucide icon */
[class*="st-key-preset_"] button { justify-content: flex-start; gap: .65rem; padding-left: .85rem; text-align: left; }
[class*="st-key-preset_"] button > div { flex: 1; justify-content: flex-start; width: auto; }
[class*="st-key-preset_"] button p { text-align: left; }
[class*="st-key-preset_"] button::before { content: ""; width: 15px; height: 15px; flex: none; background: var(--blue); -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.st-key-preset_high button::before { -webkit-mask-image: __I_FLAME__; mask-image: __I_FLAME__; background: __RED__; }
.st-key-preset_medium button::before { -webkit-mask-image: __I_ACT__; mask-image: __I_ACT__; background: #BFDBFE; }
.st-key-preset_low button::before { -webkit-mask-image: __I_MOON__; mask-image: __I_MOON__; }
[class*="st-key-preset_"] button p { font-size: .76rem; white-space: nowrap; }
[class*="st-key-preset_"] button { padding-right: .5rem; }

/* ---------- Buttons ---------- */
.stButton > button, [data-testid^="stBaseButton"] {
  font-family: var(--font-ui); font-weight: 500; border-radius: 8px; transition: all .18s var(--ease);
}
[data-testid="stBaseButton-primary"] {
  background: var(--blue-strong); color: #fff; border: 1px solid var(--blue); padding: .55rem 1.1rem;
}
[data-testid="stBaseButton-primary"]:hover { background: var(--blue); border-color: var(--blue); box-shadow: var(--glow); transform: translateY(-1px); color: #fff; }
[data-testid="stBaseButton-primary"]:active { transform: translateY(0); }
[data-testid="stBaseButton-secondary"] {
  background: transparent; color: var(--text-2); border: 1px solid var(--border-strong);
}
[data-testid="stBaseButton-secondary"]:hover { border-color: var(--blue); color: #fff; background: var(--blue-tint); }
[data-testid="stBaseButton-primary"] p { font-size: .86rem; white-space: nowrap; }
button:focus-visible { outline: 2px solid var(--blue) !important; outline-offset: 2px; }

/* ---------- Inputs ---------- */
[data-testid="stWidgetLabel"] p, label p { color: var(--text-2) !important; font-size: .84rem !important; font-weight: 500; }
[data-baseweb="select"] > div, [data-baseweb="input"] > div {
  background: var(--bg-3) !important; border: 1px solid var(--border-strong) !important; border-radius: 8px; transition: border-color .18s var(--ease), box-shadow .18s var(--ease);
}
[data-baseweb="select"] > div:hover, [data-baseweb="input"] > div:hover { border-color: rgba(59,130,246,.6) !important; }
[data-baseweb="select"] > div:focus-within { border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(59,130,246,.18); }
[data-baseweb="popover"] ul { background: var(--card) !important; border: 1px solid var(--border-strong); }
[data-baseweb="popover"] li:hover { background: var(--blue-tint) !important; }
[data-testid="stSlider"] { padding-top: .2rem; }
[data-testid="stSlider"] [role="slider"] { background: var(--blue); box-shadow: 0 0 0 4px rgba(59,130,246,.2); border: none; transition: box-shadow .18s var(--ease); }
[data-testid="stSlider"] [role="slider"]:hover, [data-testid="stSlider"] [role="slider"]:focus { box-shadow: 0 0 0 7px rgba(59,130,246,.25), 0 0 18px rgba(59,130,246,.5); }
[data-testid="stSliderThumbValue"] { color: var(--blue-soft) !important; font-family: var(--font-tech) !important; font-size: .78rem; font-weight: 600; }
[data-testid="stSliderTickBarMin"], [data-testid="stSliderTickBarMax"] { color: var(--muted); font-size: .7rem; }
[data-testid="stCheckbox"] label span { color: var(--text-2); font-size: .84rem; }
[data-baseweb="checkbox"] > div:first-child { border-color: var(--border-strong); }
[data-testid="stTooltipIcon"] svg { color: var(--muted); }

/* ---------- Alerts, expanders, tables, charts ---------- */
[data-testid="stAlert"] { border-radius: var(--radius); }
[data-testid="stAlertContainer"] { border-radius: var(--radius); border: 1px solid var(--border-strong); background: rgba(59,130,246,0.08) !important; }
[data-testid="stAlertContainer"] p, [data-testid="stAlertContainer"] li { color: var(--text-2) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) { background: rgba(59,130,246,0.12) !important; border-color: rgba(59,130,246,0.45); }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentSuccess"]) p { color: var(--blue-soft) !important; }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentWarning"]) { background: rgba(255,255,255,0.04) !important; border-color: var(--border-strong); }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) { background: rgba(248,113,113,0.09) !important; border-color: rgba(248,113,113,0.4); }
[data-testid="stAlertContainer"]:has([data-testid="stAlertContentError"]) p { color: #FCA5A5 !important; }
[data-testid="stExpander"] { background: var(--card); border: 1px solid var(--border) !important; border-radius: var(--radius); overflow: hidden; transition: border-color .18s var(--ease); }
[data-testid="stExpander"]:hover { border-color: rgba(59,130,246,.45) !important; }
[data-testid="stExpander"] summary { padding: .8rem 1rem; }
[data-testid="stExpander"] summary p { font-weight: 500; font-size: .9rem; color: var(--text); }
[data-testid="stExpander"] summary:hover { background: rgba(255,255,255,0.02); }
[data-testid="stDataFrame"] { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
[data-testid="stImage"] img, [data-testid="stImageContainer"] img { border-radius: var(--radius); border: 1px solid var(--border); }
[data-testid="stCode"], [data-testid="stCode"] pre { background: var(--bg-3) !important; border: 1px solid var(--border); border-radius: 8px; }
[data-testid="stSpinner"] { color: var(--text-2); }
[data-testid="stSpinner"] svg, [data-testid="stSpinner"] i { border-top-color: var(--blue) !important; }
[data-testid="stStatusWidget"] { color: var(--muted); }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: #23262B; border-radius: 8px; }
::-webkit-scrollbar-thumb:hover { background: #2F333A; }
.katex { color: var(--text); }


/* ---------- Added UX elements ---------- */
.tw-steps { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin: 0 0 1.4rem; }
.tw-step { display: inline-flex; align-items: center; gap: .55rem; font-size: .8rem; color: var(--muted); }
.tw-step b { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-family: var(--font-tech) !important; font-size: .68rem; color: var(--blue); background: var(--blue-tint); border: 1px solid rgba(59,130,246,.35); }
.tw-step-line { width: 28px; height: 1px; background: var(--border-strong); }
.tw-badge { display: inline-flex; align-items: center; gap: .45rem; font-size: .74rem; color: var(--text-2); background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 999px; padding: .28rem .8rem; }
.tw-badge svg { color: var(--blue); }
.tw-hero .tw-badge { margin-top: .2rem; }
.tw-footer { margin-top: 4rem; padding-top: 1.2rem; border-top: 1px solid var(--border); font-size: .76rem; color: var(--muted); line-height: 1.6; max-width: 80ch; }
.tw-stat { text-align: left; }
.tw-stat .tw-k { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-weight: 500; }
.tw-stat .tw-v { font-family: var(--font-tech) !important; font-weight: 600; font-size: 1.7rem; margin-top: .45rem; color: var(--text); }
.tw-stat .tw-s { font-size: .78rem; color: var(--muted); margin-top: .2rem; }
.tw-card.tw-stat:hover { transform: none; }

/* segmented control (chart picker) as pills */
[data-testid="stButtonGroup"] { gap: .4rem; flex-wrap: wrap; }
[data-testid^="stBaseButton-segmented_control"] { background: transparent; color: var(--muted); border: 1px solid var(--border-strong); border-radius: 999px; padding: .3rem .95rem; font-size: .8rem; transition: all .18s var(--ease); }
[data-testid^="stBaseButton-segmented_control"] p { font-size: .8rem !important; }
[data-testid^="stBaseButton-segmented_control"]:hover { color: #fff; border-color: var(--blue); }
[data-testid="stBaseButton-segmented_controlActive"] { background: var(--blue-tint); color: var(--blue-soft); border-color: var(--blue); }
[data-testid="stDownloadButton"] button { width: auto; }

/* ---------- Responsive ---------- */
html, body, .stApp, [data-testid="stAppViewContainer"], .block-container { max-width: 100%; overflow-x: hidden; }
@media (max-width: 960px) {
  .block-container { padding: 2.6rem 1.2rem 4rem; }
}
@media (max-width: 640px) {
  .block-container { padding: 3.6rem .9rem 3.5rem; }
  .tw-hero h1 { max-width: none; }
  .tw-section { margin-top: 1.7rem; }
  .tw-card { padding: 1.1rem; }
  .tw-step-line { display: none; }
  .tw-steps { gap: .5rem 1.2rem; }
  [role="tab"] { padding: .65rem .7rem; }
  [role="tab"] p { font-size: .8rem !important; }
}
"""


def _build_css() -> str:
    css = _CSS.replace("__PIRULEN__", _pirulen_font_face())
    repl = {
        "__I_ACT__": _mask("activity"),
        "__I_CHART__": _mask("chart-line"),
        "__I_LAYERS__": _mask("layers"),
        "__I_DB__": _mask("database"),
        "__I_FLAME__": _mask("flame"),
        "__I_MOON__": _mask("moon"),
        "__RED__": RED,
    }
    for key, value in repl.items():
        css = css.replace(key, value)
    return css


def inject_theme() -> None:
    """Inject the global stylesheet. Call once, right after ``st.set_page_config``."""
    st.markdown(f"<style>{_build_css()}</style>", unsafe_allow_html=True)


# ==============================================================================
# HTML BUILDERS (presentation only)
# ==============================================================================
def sidebar_brand(title: str = "AI Wellbeing", subtitle: str = "Fuzzy stress classification") -> None:
    st.markdown(
        _h(f"""
        <div class="tw-brand">
          <div class="tw-logo">{icon('activity', 17, 2)}</div>
          <div class="tw-name">{html.escape(title)}<small>{html.escape(subtitle)}</small></div>
        </div>"""),
        unsafe_allow_html=True,
    )


def side_label(text: str) -> None:
    st.markdown(f'<span class="tw-side-label">{html.escape(text)}</span>', unsafe_allow_html=True)


def key_value_rows(rows: list[tuple[str, str]], stacked: bool = False) -> None:
    cls = "tw-kv tw-kv-stacked" if stacked else "tw-kv"
    body = "".join(
        f'<div class="{cls}"><span>{html.escape(k)}</span><span>{html.escape(v)}</span></div>' for k, v in rows
    )
    st.markdown(f"<div>{body}</div>", unsafe_allow_html=True)


def hero(label: str, title: str, subtitle: str, badge_text: str) -> None:
    st.markdown(
        _h(f"""
        <div class="tw-hero">
          <div class="tw-eyebrow">{html.escape(label)}</div>
          <h1>{html.escape(title)}</h1>
          <p class="tw-sub">{html.escape(subtitle)}</p>
          <span class="tw-badge">{icon('info', 13, 2)}{html.escape(badge_text)}</span>
        </div>"""),
        unsafe_allow_html=True,
    )


def steps_strip(steps: list[str]) -> None:
    parts = []
    for i, text in enumerate(steps, 1):
        if i > 1:
            parts.append('<span class="tw-step-line"></span>')
        parts.append(f'<span class="tw-step"><b>{i}</b>{html.escape(text)}</span>')
    st.markdown(f'<div class="tw-steps">{"".join(parts)}</div>', unsafe_allow_html=True)


def stat_card(label: str, value: str, sub: str = "") -> None:
    sub_html = f'<div class="tw-s">{html.escape(sub)}</div>' if sub else ""
    st.markdown(
        _h(f"""<div class="tw-card tw-stat"><div class="tw-k">{html.escape(label)}</div>
        <div class="tw-v">{html.escape(value)}</div>{sub_html}</div>"""),
        unsafe_allow_html=True,
    )


def footer_note(text: str) -> None:
    st.markdown(f'<div class="tw-footer">{html.escape(text)}</div>', unsafe_allow_html=True)


def section_header(label: str, title: str, caption: str = "") -> None:
    cap = f"<p>{html.escape(caption)}</p>" if caption else ""
    st.markdown(
        _h(f"""
        <div class="tw-section">
          <div class="tw-label">{html.escape(label)}</div>
          <h3>{html.escape(title)}</h3>{cap}
        </div>"""),
        unsafe_allow_html=True,
    )


def mini_label(text: str) -> None:
    st.markdown(f'<span class="tw-mini">{html.escape(text)}</span>', unsafe_allow_html=True)


def score_card(value: float, medium_min: float, high_min: float) -> None:
    pct = max(0.0, min(100.0, float(value)))
    st.markdown(
        _h(f"""
        <div class="tw-card tw-score">
          <div class="tw-k">Defuzzified Stress Index</div>
          <div class="tw-num">{value:.1f}<small>/ 100</small></div>
          <div class="tw-gauge">
            <i style="flex:{medium_min};background:rgba(59,130,246,.55)"></i>
            <i style="flex:{high_min - medium_min};background:rgba(191,219,254,.45)"></i>
            <i style="flex:{100 - high_min};background:rgba(248,113,113,.55)"></i>
            <span class="tw-pin" style="left:{pct}%"></span>
          </div>
          <div class="tw-scale"><span style="left:0">0</span><span style="left:{medium_min}%">{medium_min:.0f}</span><span style="left:{high_min}%">{high_min:.0f}</span><span style="left:100%">100</span></div>
        </div>"""),
        unsafe_allow_html=True,
    )


def status_card(category: str, label: str, description: str) -> None:
    style = CATEGORY_STYLE.get(category, {"color": "#8A8F98", "tint": "rgba(255,255,255,0.04)"})
    st.markdown(
        _h(f"""
        <div class="tw-card tw-status" style="--c:{style['color']};--t:{style['tint']}">
          <div class="tw-k">Stress Category</div>
          <div class="tw-state">{html.escape(label)}</div>
          <p>{html.escape(description)}</p>
        </div>"""),
        unsafe_allow_html=True,
    )


def recommendation_card(title: str, duration: str, description: str, rationale: str) -> None:
    st.markdown(
        _h(f"""
        <div class="tw-card tw-rec">
          <div class="tw-top">
            <span class="tw-title">{html.escape(str(title))}</span>
            <span class="tw-chip">{icon('clock', 13, 2)}{html.escape(str(duration))}</span>
          </div>
          <p>{html.escape(str(description))}</p>
          <div class="tw-why"><b>Why this was recommended</b><span>{html.escape(str(rationale))}</span></div>
        </div>"""),
        unsafe_allow_html=True,
    )


def empty_state(title: str, text: str) -> None:
    st.markdown(
        _h(f"""
        <div class="tw-card tw-empty">
          <div class="tw-ico">{icon('search', 20)}</div>
          <b>{html.escape(title)}</b><span>{html.escape(text)}</span>
        </div>"""),
        unsafe_allow_html=True,
    )
