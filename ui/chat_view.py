"""Streamlit view for the stress-relief chat companion (presentation only)."""

from __future__ import annotations

import html
from typing import Any, Dict, Optional

import streamlit as st

from chat.assistant import MAX_INPUT_CHARS, stream_reply
from chat.safety import HELPLINES, SHORT_HELP_LINE, crisis_message, detect_crisis
from config.fuzzy_config import UNIVERSE_CONFIG
from ui.theme import section_header, small_note, status_pill

GREETING = (
    "Hi, I'm your wellbeing companion. I can guide you through a short breathing exercise, help you "
    "untangle a stressful day, or just listen. What's on your mind?"
)

QUICK_PROMPTS = [
    "I feel overwhelmed by my workload",
    "Guide me through a breathing exercise",
    "Help me wind down for sleep",
    "I can't stop scrolling on my phone",
]


# ------------------------------------------------------------------------------
# Configuration lookups
# ------------------------------------------------------------------------------
def _assessment_context() -> Optional[Dict[str, Any]]:
    """Latest assessment, only if the user allowed sharing it with the assistant."""
    if not st.session_state.get("chat_share_context", True):
        return None
    inference = st.session_state.get("last_inference")
    category = st.session_state.get("last_category")
    if inference is None or not category:
        return None
    recommendation = st.session_state.get("last_recommendation") or {}
    return {
        "index": inference.crisp_stress_index,
        "category": category,
        "hrv": st.session_state.get("slider_hrv", UNIVERSE_CONFIG["hrv"]["default"]),
        "screen": st.session_state.get("slider_screen", UNIVERSE_CONFIG["screen_time"]["default"]),
        "sleep": st.session_state.get("slider_sleep", UNIVERSE_CONFIG["sleep_duration"]["default"]),
        "action": recommendation.get("title"),
    }


# ------------------------------------------------------------------------------
# Callbacks
# ------------------------------------------------------------------------------
def _queue_prompt(text: str) -> None:
    st.session_state["chat_pending"] = text


def _new_chat() -> None:
    st.session_state["chat_messages"] = []
    st.toast("Started a new conversation")


# ------------------------------------------------------------------------------
# View
# ------------------------------------------------------------------------------
def render_chat_tab() -> None:
    st.session_state.setdefault("chat_messages", [])
    messages = st.session_state["chat_messages"]

    section_header(
        "Wellbeing chat",
        "Talk it through",
        "A calm space to unwind. Ask for a breathing exercise, a quick reset, or just say how your day is going.",
    )

    top_left, top_right = st.columns([3, 1], gap="medium")
    with top_left:
        status_pill("Offline demo mode · no API key required", active=False)
    with top_right:
        st.button("New chat", on_click=_new_chat, key="chat_new", width="stretch", disabled=not messages)

    with st.expander("Chat settings"):
        st.checkbox(
            "Use my latest assessment to personalise replies",
            value=True,
            key="chat_share_context",
            help="Shares only your stress category, index, the three input values and the suggested action. Never your name.",
        )
        small_note(
            "Replies use built-in offline guidance. No API key, account, or network connection is required. "
            "The companion is a wellbeing aid, not a therapist or medical service."
        )

    box = st.container(height=440, border=True)

    # Resolve the incoming prompt (typed or from a quick-start button)
    typed = st.chat_input("Type how you're feeling...", max_chars=MAX_INPUT_CHARS, key="chat_input")
    prompt = typed or st.session_state.pop("chat_pending", None)

    with box:
        with st.chat_message("assistant"):
            st.markdown(GREETING)

        if not messages and not prompt:
            st.write("")
            small_note("Try one of these to get started:")
            cols = st.columns(2, gap="small")
            for i, text in enumerate(QUICK_PROMPTS):
                with cols[i % 2]:
                    st.button(text, key=f"chat_quick_{i}", on_click=_queue_prompt, args=(text,), width="stretch")

        for m in messages:
            with st.chat_message(m["role"]):
                st.markdown(m["content"])

        if prompt:
            prompt = prompt.strip()[:MAX_INPUT_CHARS]
            messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                if detect_crisis(prompt):
                    reply = crisis_message()
                    st.markdown(reply)
                else:
                    reply = st.write_stream(
                        stream_reply(messages, _assessment_context(), api_key=None)
                    )
            messages.append({"role": "assistant", "content": str(reply)})

    small_note(
        "AI companion for stress relief, not a therapist or medical service. "
        f"<b>{html.escape(SHORT_HELP_LINE)}</b> "
        + " &middot; ".join(f"{html.escape(n)} {html.escape(num)}" for num, n, _ in HELPLINES[1:3])
    )
