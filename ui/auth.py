"""Session-only prototype authentication for the Streamlit UI.

This module intentionally does not replace or modify any backend authentication.
It provides a polished front-end login/profile experience for the academic prototype.
"""

import re
import streamlit as st


def init_auth() -> None:
    st.session_state.setdefault("authenticated", False)
    st.session_state.setdefault("user_name", "")
    st.session_state.setdefault("user_email", "")
    st.session_state.setdefault("assessment_history", [])


def login_screen() -> bool:
    """Render a session-only login screen. Returns True when authenticated."""
    init_auth()
    if st.session_state["authenticated"]:
        return True

    st.markdown(
        """
        <div class="tw-login-shell">
          <div class="tw-login-orb tw-login-orb-a"></div>
          <div class="tw-login-orb tw-login-orb-b"></div>
          <div class="tw-login-card">
            <div class="tw-login-brand">
              <span class="tw-login-mark">AI</span>
              <span><small>WELLBEING</small><b>PERSONAL CONSOLE</b></span>
            </div>
            <div class="tw-login-eyebrow">PRIVATE WELLNESS SPACE</div>
            <h1>Understand your<br><span>well-being.</span></h1>
            <p>Sign in to access your personal assessment dashboard, recommendations and session insights.</p>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    _, form_col, _ = st.columns([1, 1.05, 1])
    with form_col:
        with st.form("login_form", clear_on_submit=False):
            st.markdown('<div class="tw-form-title">Sign in</div>', unsafe_allow_html=True)
            name = st.text_input("Name", placeholder="Your name")
            email = st.text_input("Email", placeholder="you@example.com")
            password = st.text_input("Password", type="password", placeholder="••••••••")
            remember = st.checkbox("Keep this session active", value=True)
            submitted = st.form_submit_button("Enter dashboard", type="primary", width="stretch")

        st.caption("Prototype login · session-only. No existing API or backend authentication is changed.")
        if submitted:
            if not name.strip() or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()):
                st.error("Enter your name and a valid email address.")
            elif not password:
                st.error("Enter a password to continue.")
            else:
                st.session_state["authenticated"] = True
                st.session_state["user_name"] = name.strip()
                st.session_state["user_email"] = email.strip()
                st.session_state["remember_session"] = remember
                st.rerun()

    return False


def logout() -> None:
    for key in ("authenticated", "user_name", "user_email", "remember_session"):
        st.session_state.pop(key, None)
    st.session_state["authenticated"] = False
    st.session_state["assessment_history"] = []
    st.rerun()


def initials(name: str) -> str:
    parts = [p for p in name.split() if p]
    if not parts:
        return "U"
    return "".join(p[0] for p in parts[:2]).upper()
