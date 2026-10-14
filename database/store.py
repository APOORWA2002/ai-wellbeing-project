"""Local SQLite persistence for the AI Wellbeing prototype.

This local demo is not a production clinical-record system. User data is stored on
the machine running Streamlit. Protect the database file and do not commit it.
"""
from __future__ import annotations

import hashlib
from contextlib import contextmanager
import hmac
import os
import secrets
import sqlite3
from pathlib import Path
from typing import Any, Optional

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("AI_WELLBEING_DB_PATH", ROOT.parent / "data" / "user_data.sqlite3"))


@contextmanager
def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with _connect() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            display_name TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            save_assessments INTEGER NOT NULL DEFAULT 0,
            save_chats INTEGER NOT NULL DEFAULT 0,
            save_games INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            hrv REAL NOT NULL, screen_time REAL NOT NULL, sleep REAL NOT NULL,
            stress_index REAL NOT NULL, category TEXT NOT NULL,
            recommendation TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL DEFAULT 'Wellbeing chat',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK(role IN ('user','assistant')),
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS game_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            game_name TEXT NOT NULL, duration_seconds INTEGER NOT NULL DEFAULT 0,
            reflection TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS counsellor_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            preferred_contact TEXT NOT NULL, preferred_time TEXT,
            message TEXT, consent INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Demo request — not sent',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        """)
    try:
        os.chmod(DB_PATH, 0o600)
    except OSError:
        pass


def _password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 310_000)


def register_user(email: str, display_name: str, password: str) -> tuple[bool, str, Optional[dict]]:
    email = email.strip().lower()
    display_name = display_name.strip()
    if not email or "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        return False, "Enter a valid email address.", None
    if not display_name or len(display_name) > 80:
        return False, "Enter a display name (maximum 80 characters).", None
    if len(password) < 10:
        return False, "Use a password with at least 10 characters.", None
    salt = secrets.token_bytes(16)
    digest = _password(password, salt)
    try:
        with _connect() as conn:
            cur = conn.execute(
                "INSERT INTO users(email,display_name,password_salt,password_hash) VALUES(?,?,?,?)",
                (email, display_name, salt.hex(), digest.hex()),
            )
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return False, "An account with that email already exists.", None
    return True, "Account created. You are signed in.", {"id": user_id, "email": email, "display_name": display_name}


def authenticate_user(email: str, password: str) -> Optional[dict]:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    if row is None:
        return None
    try:
        salt = bytes.fromhex(row["password_salt"])
        expected = bytes.fromhex(row["password_hash"])
    except ValueError:
        return None
    if not hmac.compare_digest(_password(password, salt), expected):
        return None
    return {"id": row["id"], "email": row["email"], "display_name": row["display_name"]}



def update_profile(user_id: int, display_name: str) -> bool:
    """Update the display name for the authenticated account."""
    display_name = display_name.strip()
    if not display_name or len(display_name) > 80:
        raise ValueError("Display name must contain 1–80 characters.")
    with _connect() as conn:
        cur = conn.execute("UPDATE users SET display_name=? WHERE id=?", (display_name, user_id))
    return cur.rowcount > 0


def delete_all_conversations(user_id: int) -> int:
    """Delete only conversations owned by this user; messages cascade automatically."""
    with _connect() as conn:
        cur = conn.execute("DELETE FROM conversations WHERE user_id=?", (user_id,))
    return cur.rowcount


def get_preferences(user_id: int) -> dict:
    with _connect() as conn:
        row = conn.execute(
            "SELECT save_assessments,save_chats,save_games FROM users WHERE id=?", (user_id,)
        ).fetchone()
    return dict(row) if row else {"save_assessments": 0, "save_chats": 0, "save_games": 0}


def update_preferences(user_id: int, assessments: bool, chats: bool, games: bool) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE users SET save_assessments=?,save_chats=?,save_games=? WHERE id=?",
            (int(assessments), int(chats), int(games), user_id),
        )


def save_assessment(user_id: int, hrv: float, screen: float, sleep: float,
                    stress_index: float, category: str, recommendation: str = "") -> None:
    with _connect() as conn:
        conn.execute(
            """INSERT INTO assessments(user_id,hrv,screen_time,sleep,stress_index,category,recommendation)
               VALUES(?,?,?,?,?,?,?)""",
            (user_id, hrv, screen, sleep, stress_index, category, recommendation[:500]),
        )


def list_assessments(user_id: int) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM assessments WHERE user_id=? ORDER BY created_at DESC,id DESC", (user_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def delete_assessment(user_id: int, assessment_id: int) -> bool:
    with _connect() as conn:
        cur = conn.execute("DELETE FROM assessments WHERE id=? AND user_id=?", (assessment_id, user_id))
    return cur.rowcount > 0


def save_conversation(user_id: int, messages: list[dict]) -> Optional[int]:
    cleaned = [(m.get("role"), str(m.get("content", ""))[:2000]) for m in messages
               if m.get("role") in ("user", "assistant") and str(m.get("content", "")).strip()]
    if not cleaned:
        return None
    title = next((c for r, c in cleaned if r == "user"), "Wellbeing chat")[:70]
    with _connect() as conn:
        cur = conn.execute("INSERT INTO conversations(user_id,title) VALUES(?,?)", (user_id, title))
        conversation_id = int(cur.lastrowid)
        conn.executemany(
            "INSERT INTO chat_messages(conversation_id,role,content) VALUES(?,?,?)",
            [(conversation_id, role, content) for role, content in cleaned],
        )
    return conversation_id


def list_conversations(user_id: int) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            """SELECT c.id,c.title,c.created_at,COUNT(m.id) AS message_count
               FROM conversations c LEFT JOIN chat_messages m ON m.conversation_id=c.id
               WHERE c.user_id=? GROUP BY c.id ORDER BY c.created_at DESC,c.id DESC""",
            (user_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def get_conversation(user_id: int, conversation_id: int) -> list[dict]:
    with _connect() as conn:
        owned = conn.execute("SELECT id FROM conversations WHERE id=? AND user_id=?",
                              (conversation_id, user_id)).fetchone()
        if not owned:
            return []
        rows = conn.execute(
            "SELECT role,content,created_at FROM chat_messages WHERE conversation_id=? ORDER BY id",
            (conversation_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def delete_conversation(user_id: int, conversation_id: int) -> bool:
    with _connect() as conn:
        cur = conn.execute("DELETE FROM conversations WHERE id=? AND user_id=?", (conversation_id, user_id))
    return cur.rowcount > 0


def save_game_session(user_id: int, game_name: str, duration_seconds: int = 0, reflection: str = "") -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO game_sessions(user_id,game_name,duration_seconds,reflection) VALUES(?,?,?,?)",
            (user_id, game_name[:80], max(0, int(duration_seconds)), reflection[:500]),
        )


def list_game_sessions(user_id: int) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM game_sessions WHERE user_id=? ORDER BY created_at DESC,id DESC", (user_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def create_counsellor_request(user_id: int, preferred_contact: str, preferred_time: str,
                              message: str, consent: bool) -> None:
    if not consent:
        raise ValueError("Consent is required.")
    with _connect() as conn:
        conn.execute(
            """INSERT INTO counsellor_requests(user_id,preferred_contact,preferred_time,message,consent)
               VALUES(?,?,?,?,?)""",
            (user_id, preferred_contact[:120], preferred_time[:120], message[:1000], 1),
        )


def list_counsellor_requests(user_id: int) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id,preferred_contact,preferred_time,message,status,created_at FROM counsellor_requests "
            "WHERE user_id=? ORDER BY created_at DESC,id DESC", (user_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def delete_account(user_id: int) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM users WHERE id=?", (user_id,))
