"""Account, history, relaxation games, counsellor demo and chat-popup UI."""
from __future__ import annotations

import html
import json
import time
from datetime import datetime

import pandas as pd
import streamlit as st

from database import store
from chat.assistant import demo_reply
from chat.safety import detect_crisis, crisis_message


def current_user():
    return st.session_state.get("authenticated_user")


def _need_login():
    st.info("Sign in or create a demo account in **Account & Settings** to use private history and saved features.")
    return False


def render_account():
    st.subheader("Account & settings")
    user = current_user()
    if user:
        st.success(f"Signed in as **{user['display_name']}**")
        with st.form("profile_form"):
            display_name = st.text_input("Display name", value=user["display_name"], max_chars=80)
            save_profile = st.form_submit_button("Update profile")
        if save_profile:
            try:
                store.update_profile(user["id"], display_name)
                st.session_state["authenticated_user"]["display_name"] = display_name.strip()
                st.success("Profile updated.")
                st.rerun()
            except ValueError as exc:
                st.error(str(exc))
        if st.button("Sign out", key="account_signout"):
            st.session_state.pop("authenticated_user", None)
            st.session_state.pop("account_notice", None)
            st.rerun()
        prefs = store.get_preferences(user["id"])
        st.markdown("#### Privacy preferences")
        with st.form("preferences_form"):
            save_assessments = st.checkbox("Save my stress assessments", value=bool(prefs["save_assessments"]))
            save_chats = st.checkbox("Save chat conversations when I choose to save them", value=bool(prefs["save_chats"]))
            save_games = st.checkbox("Save completed relaxation activities", value=bool(prefs["save_games"]))
            submitted = st.form_submit_button("Save preferences", type="primary")
        if submitted:
            store.update_preferences(user["id"], save_assessments, save_chats, save_games)
            st.success("Your preferences have been updated.")
        st.caption("Local demo note: your data is stored in a SQLite file on the machine running Streamlit. Use only test data until this application receives a security and privacy review.")
        st.divider()
        st.markdown("#### Export my data")
        if st.button("Prepare personal data export", key="prepare_personal_export"):
            assessments = store.list_assessments(user["id"])
            conversations = []
            for item in store.list_conversations(user["id"]):
                conversations.append({"title": item["title"], "created_at": item["created_at"],
                                      "messages": store.get_conversation(user["id"], item["id"])})
            export_data = {
                "profile": {"email": user["email"], "display_name": user["display_name"]},
                "assessments": assessments,
                "conversations": conversations,
                "game_sessions": store.list_game_sessions(user["id"]),
                "counsellor_demo_requests": store.list_counsellor_requests(user["id"]),
                "export_note": "Counsellor requests are local demo records, not sent to a real service."
            }
            st.download_button("Download my data (JSON)", json.dumps(export_data, indent=2, ensure_ascii=False, default=str),
                               file_name="ai_wellbeing_personal_data.json", mime="application/json",
                               key="download_personal_export")
        st.divider()
        with st.expander("Delete my account and saved data"):
            st.warning("This permanently deletes this demo account and its associated assessments, conversations, game sessions and contact requests.")
            confirm = st.checkbox("I understand this cannot be undone.", key="delete_account_confirm")
            if st.button("Delete account permanently", type="secondary", disabled=not confirm):
                store.delete_account(user["id"])
                st.session_state.pop("authenticated_user", None)
                for k in ("chat_messages", "popup_chat_messages"):
                    st.session_state.pop(k, None)
                st.success("Account and associated data deleted.")
                st.rerun()
        return

    login_col, register_col = st.columns(2, gap="large")
    with login_col:
        st.markdown("#### Sign in")
        with st.form("login_form"):
            email = st.text_input("Email", key="login_email")
            password = st.text_input("Password", type="password", key="login_password")
            login = st.form_submit_button("Sign in", type="primary", use_container_width=True)
        if login:
            account = store.authenticate_user(email, password)
            if account:
                st.session_state["authenticated_user"] = account
                st.success("Signed in successfully.")
                st.rerun()
            else:
                st.error("Email or password was not recognised.")
    with register_col:
        st.markdown("#### Create account")
        with st.form("register_form"):
            display_name = st.text_input("Display name", key="register_name")
            reg_email = st.text_input("Email address", key="register_email")
            reg_password = st.text_input("Password (10+ characters)", type="password", key="register_password")
            reg_confirm = st.text_input("Confirm password", type="password", key="register_confirm")
            register = st.form_submit_button("Create account", use_container_width=True)
        if register:
            if reg_password != reg_confirm:
                st.error("The passwords do not match.")
            else:
                ok, message, account = store.register_user(reg_email, display_name, reg_password)
                if ok:
                    st.session_state["authenticated_user"] = account
                    st.success(message)
                    st.rerun()
                else:
                    st.error(message)
    st.caption("This is local demo authentication, not a production identity service. Use a unique test password; do not reuse your personal password.")


def render_history():
    st.subheader("My wellbeing history")
    user = current_user()
    if not user:
        _need_login()
        return
    prefs = store.get_preferences(user["id"])
    if not prefs["save_assessments"]:
        st.info("Assessment history saving is turned off in your privacy preferences.")
    else:
        rows = store.list_assessments(user["id"])
        st.markdown("#### Stress assessments")
        if rows:
            df = pd.DataFrame(rows)
            df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
            c1, c2 = st.columns(2)
            with c1:
                st.metric("Saved assessments", len(df))
            with c2:
                st.metric("Latest category", str(df.iloc[0]["category"]))
            start = st.date_input("From date", value=df["created_at"].min().date(), key="history_start")
            end = st.date_input("To date", value=datetime.now().date(), key="history_end")
            filtered = df[(df["created_at"].dt.date >= start) & (df["created_at"].dt.date <= end)]
            if not filtered.empty:
                st.markdown("#### Stress index over time")
                st.caption("This chart shows saved educational assessment estimates; it is not a clinical measure of recovery.")
                chart_df = filtered.sort_values("created_at").set_index("created_at")[["stress_index"]]
                st.line_chart(chart_df, y="stress_index", color="#4D9B91")
            st.dataframe(filtered[["created_at","stress_index","category","hrv","screen_time","sleep","recommendation"]],
                         use_container_width=True, hide_index=True)
            st.download_button("Export visible history as CSV", filtered.to_csv(index=False).encode("utf-8"),
                               file_name="my_wellbeing_history.csv", mime="text/csv")
            with st.expander("Delete an assessment"):
                choice = st.selectbox("Select assessment", options=rows,
                    format_func=lambda r: f"#{r['id']} · {r['created_at']} · {r['category']} · {r['stress_index']:.1f}",
                    key="delete_assessment_choice")
                confirm = st.checkbox("Confirm deletion", key="delete_assessment_confirm")
                if st.button("Delete selected assessment", disabled=not confirm):
                    store.delete_assessment(user["id"], int(choice["id"]))
                    st.success("Assessment deleted.")
                    st.rerun()
        else:
            st.info("No saved assessments yet. Complete an assessment, then use the save option on this page.")

    st.divider()
    st.markdown("#### Save latest assessment")
    latest = st.session_state.get("last_inference")
    category = st.session_state.get("last_category")
    recommendation = st.session_state.get("last_recommendation") or {}
    if latest is not None and category:
        st.write(f"Latest session result: **{category}** · stress index {latest.crisp_stress_index:.1f}/100.")
        if st.button("Save this assessment to my history", key="save_assessment"):
            prefs = store.get_preferences(user["id"])
            if not prefs["save_assessments"]:
                st.warning("Turn on assessment saving in Account & Settings first.")
            else:
                store.save_assessment(user["id"],
                    float(st.session_state.get("slider_hrv", 0)),
                    float(st.session_state.get("slider_screen", 0)),
                    float(st.session_state.get("slider_sleep", 0)),
                    float(latest.crisp_stress_index), str(category),
                    str(recommendation.get("title", "")))
                st.success("Assessment saved to your private history.")
                st.rerun()
    else:
        st.caption("Complete a stress assessment first to save a result.")

    st.divider()
    st.markdown("#### Chat history")
    messages = st.session_state.get("chat_messages", [])
    prefs = store.get_preferences(user["id"])
    if messages:
        if st.button("Save current wellbeing chat", disabled=not bool(prefs["save_chats"]), key="save_chat_history"):
            conversation_id = store.save_conversation(user["id"], messages)
            if conversation_id:
                st.success(f"Conversation saved (reference #{conversation_id}).")
                st.rerun()
        if not prefs["save_chats"]:
            st.caption("Enable chat saving in Account & Settings to save conversations.")
    conversations = store.list_conversations(user["id"])
    if conversations:
        chosen = st.selectbox("Saved conversation", conversations,
            format_func=lambda c: f"#{c['id']} · {c['title']} · {c['created_at']}", key="conversation_choice")
        loaded = store.get_conversation(user["id"], int(chosen["id"]))
        with st.expander("Open selected conversation"):
            for msg in loaded:
                st.markdown(f"**{msg['role'].title()}:** {msg['content']}")
            if st.button("Delete selected conversation", key="delete_conversation"):
                store.delete_conversation(user["id"], int(chosen["id"]))
                st.success("Conversation deleted.")
                st.rerun()
    else:
        st.caption("No saved conversations.")
    if conversations:
        clear_all = st.checkbox("I confirm I want to delete all my saved conversations", key="clear_all_conversations_confirm")
        if st.button("Delete all saved conversations", disabled=not clear_all, key="clear_all_conversations"):
            store.delete_all_conversations(user["id"])
            st.success("All saved conversations were deleted.")
            st.rerun()

    st.divider()
    st.markdown("#### Completed wellbeing activities")
    game_rows = store.list_game_sessions(user["id"])
    if game_rows:
        st.dataframe(pd.DataFrame(game_rows), use_container_width=True, hide_index=True)
    else:
        st.caption("No saved activities yet. Activity saving is optional and controlled in Account & Settings.")


def render_games():
    st.subheader("Relax & Play")
    st.write("Optional, gentle activities for grounding, attention and relaxation. These are not clinical measures.")
    game = st.selectbox("Choose an activity", ["Guided breathing", "5-4-3-2-1 grounding", "Calm matching game", "Mindfulness check-in"], key="game_select")
    user = current_user()
    prefs = store.get_preferences(user["id"]) if user else {"save_games": 0}

    if game == "Guided breathing":
        st.markdown("#### Follow a comfortable breathing rhythm")
        duration = st.select_slider("Session length", options=[1,2,3,5], value=2, format_func=lambda x: f"{x} minute{'s' if x != 1 else ''}")
        pace = st.select_slider("Breathing pace", options=["Gentle","Slower"], value="Gentle")
        breath_state = st.session_state.setdefault("breath_state", "stopped")
        pace_seconds = 10 if pace == "Slower" else 8
        if breath_state == "running":
            st.markdown(f"""<style>
            @keyframes breathePulse {{0%,100%{{transform:scale(.76);opacity:.78}}50%{{transform:scale(1);opacity:1}}}}
            .breath-orb{{width:150px;height:150px;border-radius:50%;margin:22px auto;background:radial-gradient(circle at 30% 30%,#b5eadf,#579f9a);box-shadow:0 0 0 16px #579f9a20;animation:breathePulse {pace_seconds}s ease-in-out infinite;display:flex;align-items:center;justify-content:center;color:#123f40;font-weight:700}}
            @media(prefers-reduced-motion:reduce){{.breath-orb{{animation:none;transform:none}}}}
            </style><div class="breath-orb">Breathe gently</div>""", unsafe_allow_html=True)
        else:
            st.markdown(f"""<div style="width:150px;height:150px;border-radius:50%;margin:22px auto;background:#b5eadf;display:flex;align-items:center;justify-content:center;color:#123f40;font-weight:700">{'Paused' if breath_state == 'paused' else 'Ready when you are'}</div>""", unsafe_allow_html=True)
        st.caption("Breathe in comfortably as the circle expands, then breathe out as it contracts. No breath-holding is required; stop if you feel uncomfortable.")
        b1, b2, b3 = st.columns(3)
        with b1:
            if breath_state in ("stopped", "paused") and st.button("Start" if breath_state == "stopped" else "Resume", key="breath_start"):
                st.session_state["breath_state"] = "running"
                st.rerun()
        with b2:
            if breath_state == "running" and st.button("Pause", key="breath_pause"):
                st.session_state["breath_state"] = "paused"
                st.rerun()
        with b3:
            if breath_state != "stopped" and st.button("Stop & finish", key="breath_stop"):
                st.session_state["breath_state"] = "stopped"
                _record_game(user, prefs, "Guided breathing", duration*60)
                st.success("Nice work taking a moment for yourself.")
                st.rerun()
    elif game == "5-4-3-2-1 grounding":
        steps = [
            ("5 things you can see", "Look around and name five things you can see."),
            ("4 things you can feel", "Notice four sensations, such as your feet on the floor."),
            ("3 things you can hear", "Listen for three sounds near or far away."),
            ("2 things you can smell", "Notice two smells, or two scents you remember."),
            ("1 thing you can taste", "Notice one taste or the feeling inside your mouth."),
        ]
        index = st.session_state.get("grounding_step", 0)
        st.progress(index/5)
        if index < 5:
            st.markdown(f"### Step {index+1} of 5: {steps[index][0]}")
            st.write(steps[index][1])
            st.text_input("Optional reflection (you can leave this blank)", key=f"grounding_reflection_{index}")
            left, right = st.columns(2)
            with left:
                if st.button("Next step", key=f"grounding_next_{index}"):
                    st.session_state["grounding_step"] = index+1
                    st.rerun()
            with right:
                if st.button("Skip this step", key=f"grounding_skip_{index}"):
                    st.session_state["grounding_step"] = index+1
                    st.rerun()
        else:
            st.success("Grounding activity complete. Take a moment and notice how you feel.")
            if st.button("Finish and restart", key="grounding_restart"):
                _record_game(user, prefs, "5-4-3-2-1 grounding", 0)
                st.session_state["grounding_step"] = 0
                st.rerun()
    elif game == "Calm matching game":
        st.write("Choose two cards at a time and find matching symbols. There is no score or time pressure.")
        symbols = ["🌿","🌙","☁️","🌊","🌿","🌙","☁️","🌊"]
        if "matching_order" not in st.session_state:
            import random
            pairs = ["🌿","🌙","☁️","🌊"]
            random.shuffle(pairs)
            st.session_state["matching_order"] = pairs + pairs
            random.shuffle(st.session_state["matching_order"])
            st.session_state["matching_open"] = []
            st.session_state["matching_found"] = []
            st.session_state.pop("matching_completion_recorded", None)
        cols = st.columns(4)
        for i, symbol in enumerate(st.session_state["matching_order"]):
            with cols[i%4]:
                if i in st.session_state["matching_found"]:
                    st.button(symbol, key=f"match_{i}", disabled=True, use_container_width=True)
                else:
                    label = symbol if i in st.session_state["matching_open"] else "?"
                    if st.button(label, key=f"match_{i}", use_container_width=True):
                        opened = st.session_state["matching_open"]
                        if len(opened) == 2:
                            opened = []
                            st.session_state["matching_open"] = opened
                        if i not in opened:
                            opened.append(i)
                        if len(opened) == 2:
                            a,b = opened
                            if st.session_state["matching_order"][a] == st.session_state["matching_order"][b]:
                                st.session_state["matching_found"] = sorted(set(st.session_state["matching_found"]+[a,b]))
                                st.session_state["matching_open"] = []
                        st.rerun()
        if len(st.session_state["matching_found"]) == 8:
            st.success("All pairs found. Well done!")
            if not st.session_state.get("matching_completion_recorded"):
                _record_game(user, prefs, "Calm matching game", 0)
                st.session_state["matching_completion_recorded"] = True
        if st.button("Restart matching game", key="match_again"):
            for k in ("matching_order","matching_open","matching_found","matching_completion_recorded"): st.session_state.pop(k,None)
            st.rerun()
    else:
        st.write("Take a moment to check in. You can skip any question.")
        mood = st.radio("How are you feeling right now?", ["Calm","Okay","Tense","Overwhelmed","Prefer not to say"], horizontal=True)
        activity = st.selectbox("What might help?", ["A short walk","A breathing break","Talk to someone","Take a screen break","Not sure yet"])
        helpful = st.radio("Did this check-in help?", ["Skip","A little","Somewhat","A lot"], horizontal=True)
        if st.button("Finish check-in", key="mood_finish"):
            _record_game(user, prefs, "Mindfulness check-in", 0, "" if mood == "Prefer not to say" else f"Mood: {mood}; possible support: {activity}; helpful: {helpful}")
            st.success("Thanks for checking in. You can choose any small next step that feels right for you.")


def _record_game(user, prefs, name, duration, reflection=""):
    if user and prefs.get("save_games"):
        store.save_game_session(user["id"], name, duration, reflection)
        st.caption("Saved to your account.")
    elif user:
        st.caption("Not saved — game progress saving is off in your preferences.")
    else:
        st.caption("Sign in and enable game saving if you want to keep a record.")


def render_counsellor():
    st.subheader("Talk to a counsellor")
    st.info("Demo workflow only: this project is not connected to a real counsellor or counselling service. Submitting this form will save a local demo request; nobody will be contacted.")
    st.write("If you would like human support, consider contacting a verified university counselling service or healthcare professional. For immediate danger, contact local emergency services or go to the nearest emergency department.")
    user = current_user()
    if not user:
        _need_login()
        return
    with st.form("counsellor_request_form"):
        contact = st.selectbox("Preferred contact method", ["Email (demo only)","Phone (demo only)","In-person (demo only)","No preference"])
        preferred_time = st.selectbox("Preferred time (optional)", ["No preference","Morning","Afternoon","Evening","Arrange later"])
        message = st.text_area("Short message (optional)", max_chars=1000, help="Avoid including highly sensitive or identifying details in this local demo.")
        consent = st.checkbox("I understand this is a demo and no real counsellor will receive this request.")
        submitted = st.form_submit_button("Submit demo request", type="primary")
    if submitted:
        if not consent:
            st.error("Please confirm the demo limitation before submitting.")
        else:
            store.create_counsellor_request(user["id"], contact, preferred_time, message, consent)
            st.success("Demo request saved locally. No counsellor has been contacted.")
    requests = store.list_counsellor_requests(user["id"])
    if requests:
        st.markdown("#### My requests")
        st.dataframe(pd.DataFrame(requests), use_container_width=True, hide_index=True)


def render_floating_chat():
    """App-wide popup launcher. CSS pins the launcher near the viewport bottom-right."""
    st.markdown("""<style>
    div[data-testid="stPopover"]{position:fixed;right:1.2rem;bottom:1rem;z-index:9999}
    div[data-testid="stPopover"] button{border-radius:999px!important;box-shadow:0 5px 22px #0003!important}
    </style>""", unsafe_allow_html=True)
    _, _, right = st.columns([5, 1, 1])
    with right:
        with st.popover("💬 Wellbeing chat", use_container_width=True):
            st.markdown("#### Wellbeing Companion")
            st.caption("Offline demo · not a therapist or medical service")
            messages = st.session_state.setdefault("popup_chat_messages", [])
            for item in messages[-8:]:
                with st.chat_message(item["role"]):
                    st.markdown(item["content"])
            quick_prompts = ["Help me relax", "Exam stress", "I can't sleep", "Counsellor info"]
            for row_start in (0, 2):
                quick_cols = st.columns(2)
                for offset, quick in enumerate(quick_prompts[row_start:row_start + 2]):
                    with quick_cols[offset]:
                        idx = row_start + offset
                        if st.button(quick, key=f"popup_quick_{idx}", use_container_width=True):
                            messages.append({"role":"user","content":quick})
                            if detect_crisis(quick):
                                reply = crisis_message()
                            elif quick == "Counsellor info":
                                reply = ("You can open the **Talk to a Counsellor** tab to submit a local demo request. "
                                         "This prototype is not connected to a real counsellor, so no one will be contacted.")
                            else:
                                reply = demo_reply(messages)
                            messages.append({"role":"assistant","content":reply})
                            st.rerun()
            with st.form("popup_chat_form", clear_on_submit=True):
                prompt = st.text_input("How can I help?", max_chars=1000, key="popup_chat_input")
                sent = st.form_submit_button("Send")
            if sent and prompt.strip():
                prompt = prompt.strip()
                messages.append({"role":"user","content":prompt})
                reply = crisis_message() if detect_crisis(prompt) else demo_reply(messages)
                messages.append({"role":"assistant","content":reply})
                st.rerun()
            if st.button("Clear popup conversation", key="popup_clear"):
                st.session_state["popup_chat_messages"] = []
                st.rerun()
