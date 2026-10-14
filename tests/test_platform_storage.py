"""Tests for account-scoped local demo persistence."""
import pytest
from database import store


@pytest.fixture
def db(tmp_path, monkeypatch):
    monkeypatch.setattr(store, "DB_PATH", tmp_path / "test.sqlite3")
    store.init_db()
    return store


def _user(db, email):
    ok, _, user = db.register_user(email, "Test User", "secure-test-password")
    assert ok
    return user


def test_register_login_and_password_hashing(db):
    user = _user(db, "one@example.com")
    assert db.authenticate_user("ONE@example.com", "secure-test-password")["id"] == user["id"]
    assert db.authenticate_user("one@example.com", "wrong-password") is None
    with db._connect() as conn:
        row = conn.execute("SELECT password_hash FROM users WHERE id=?", (user["id"],)).fetchone()
    assert row["password_hash"] != "secure-test-password"


def test_duplicate_email_and_password_validation(db):
    _user(db, "one@example.com")
    ok, msg, _ = db.register_user("one@example.com", "Other", "secure-test-password")
    assert not ok and "already exists" in msg
    ok, _, _ = db.register_user("two@example.com", "Other", "short")
    assert not ok


def test_user_data_isolation_for_assessments_and_conversations(db):
    a = _user(db, "one@example.com")
    b = _user(db, "two@example.com")
    db.save_assessment(a["id"], 45, 7, 6, 52.1, "Medium", "Take a break")
    assert len(db.list_assessments(a["id"])) == 1
    assert db.list_assessments(b["id"]) == []
    conversation = db.save_conversation(a["id"], [
        {"role": "user", "content": "I feel stressed"},
        {"role": "assistant", "content": "Try a gentle reset."},
    ])
    assert len(db.get_conversation(a["id"], conversation)) == 2
    assert db.get_conversation(b["id"], conversation) == []
    assert not db.delete_conversation(b["id"], conversation)
    assert db.delete_conversation(a["id"], conversation)


def test_preferences_and_counsellor_consent(db):
    user = _user(db, "one@example.com")
    db.update_preferences(user["id"], False, True, True)
    assert db.get_preferences(user["id"]) == {
        "save_assessments": 0, "save_chats": 1, "save_games": 1
    }
    with pytest.raises(ValueError):
        db.create_counsellor_request(user["id"], "No preference", "", "", False)
    db.create_counsellor_request(user["id"], "Email (demo only)", "Morning", "", True)
    assert db.list_counsellor_requests(user["id"])[0]["status"] == "Demo request — not sent"


def test_account_deletion_cascades(db):
    user = _user(db, "one@example.com")
    db.save_assessment(user["id"], 45, 7, 6, 52.1, "Medium", "Take a break")
    db.save_game_session(user["id"], "Breathing", 60)
    db.delete_account(user["id"])
    assert db.list_assessments(user["id"]) == []
    assert db.list_game_sessions(user["id"]) == []


def test_privacy_defaults_and_profile_update(db):
    user = _user(db, "profile@example.com")
    assert db.get_preferences(user["id"]) == {
        "save_assessments": 0, "save_chats": 0, "save_games": 0
    }
    assert db.update_profile(user["id"], "Updated Name")
    with db._connect() as conn:
        row = conn.execute("SELECT display_name FROM users WHERE id=?", (user["id"],)).fetchone()
    assert row["display_name"] == "Updated Name"
    with pytest.raises(ValueError):
        db.update_profile(user["id"], "  ")


def test_clear_all_conversations_is_user_scoped(db):
    owner = _user(db, "owner@example.com")
    other = _user(db, "other@example.com")
    first = db.save_conversation(owner["id"], [{"role": "user", "content": "first"}])
    second = db.save_conversation(owner["id"], [{"role": "user", "content": "second"}])
    outsider = db.save_conversation(other["id"], [{"role": "user", "content": "keep me"}])
    assert db.delete_all_conversations(owner["id"]) == 2
    assert db.list_conversations(owner["id"]) == []
    assert len(db.get_conversation(other["id"], outsider)) == 1
