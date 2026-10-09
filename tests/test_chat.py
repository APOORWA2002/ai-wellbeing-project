"""Tests for the stress-relief chat module (no network or API key required)."""

import pytest

try:
    import httpx
    import anthropic
except ImportError:  # optional: offline demo mode does not need these packages
    httpx = None
    anthropic = None

from chat.assistant import (
    DEFAULT_MODEL,
    MAX_HISTORY,
    SYSTEM_PROMPT,
    build_system_prompt,
    demo_reply,
    prepare_messages,
    resolve_api_key,
    resolve_model,
    stream_reply,
)
from chat.safety import HELPLINES, crisis_message, detect_crisis


# ---------------- fakes ----------------
class _FakeStream:
    def __init__(self, chunks):
        self._chunks = chunks

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    @property
    def text_stream(self):
        return iter(self._chunks)


class _FakeMessages:
    def __init__(self, chunks=None, error=None):
        self.chunks, self.error, self.kwargs = chunks or [], error, None

    def stream(self, **kwargs):
        self.kwargs = kwargs
        if self.error:
            raise self.error
        return _FakeStream(self.chunks)


class _FakeClient:
    def __init__(self, chunks=None, error=None):
        self.messages = _FakeMessages(chunks, error)


# ---------------- safety ----------------
class TestCrisisDetection:
    @pytest.mark.parametrize("text", [
        "I want to kill myself",
        "i think about suicide a lot",
        "I don\u2019t want to live anymore",
        "sometimes I want to end my life",
        "I've been hurting myself",
        "there's no point in living",
        "I wish I was dead",
    ])
    def test_detects_crisis(self, text):
        assert detect_crisis(text)

    @pytest.mark.parametrize("text", [
        "I'm stressed about my exam",
        "this deadline is killing me with work",  # idiom should not match 'kill myself'
        "I can't sleep and my screen time is high",
        "",
    ])
    def test_ignores_normal_stress(self, text):
        assert not detect_crisis(text)

    def test_crisis_message_lists_every_helpline(self):
        msg = crisis_message()
        for number, _, _ in HELPLINES:
            assert number in msg


# ---------------- prompt + messages ----------------
class TestPrompt:
    def test_no_context_returns_base_prompt(self):
        assert build_system_prompt(None) == SYSTEM_PROMPT

    def test_context_is_included(self):
        p = build_system_prompt({"index": 86.7, "category": "High", "hrv": 30, "screen": 14, "sleep": 3.5, "action": "Sleep Hygiene Tip"})
        assert "86.7/100" in p and "High" in p and "Sleep Hygiene Tip" in p and "3.5" in p

    def test_prepare_messages_starts_with_user_and_trims(self):
        history = [{"role": "assistant", "content": "hi"}] + [
            {"role": "user" if i % 2 == 0 else "assistant", "content": f"m{i}"} for i in range(60)
        ]
        out = prepare_messages(history)
        assert out[0]["role"] == "user"
        assert len(out) <= MAX_HISTORY

    def test_prepare_messages_drops_empty_and_invalid(self):
        out = prepare_messages([{"role": "user", "content": "  "}, {"role": "system", "content": "x"}, {"role": "user", "content": "ok"}])
        assert out == [{"role": "user", "content": "ok"}]


# ---------------- configuration ----------------
class TestConfig:
    def test_key_precedence(self):
        assert resolve_api_key("session", {"ANTHROPIC_API_KEY": "secret"}, {"ANTHROPIC_API_KEY": "env"}) == "session"
        assert resolve_api_key(None, {"ANTHROPIC_API_KEY": "secret"}, {"ANTHROPIC_API_KEY": "env"}) == "secret"
        assert resolve_api_key("  ", None, {"ANTHROPIC_API_KEY": "env"}) == "env"
        assert resolve_api_key(None, None, {}) is None

    def test_model_default_and_override(self):
        assert resolve_model(None, {}) == DEFAULT_MODEL
        assert resolve_model({"ANTHROPIC_MODEL": "custom-model"}, {}) == "custom-model"


# ---------------- demo mode ----------------
class TestDemoReply:
    @pytest.mark.parametrize("text,keyword", [
        ("I feel so anxious", "breath"),
        ("I can't sleep", "sleep"),
        ("too much time on my phone", "screen"),
        ("my exam is tomorrow", "step"),
    ])
    def test_topic_replies(self, text, keyword):
        assert keyword in demo_reply([{"role": "user", "content": text}]).lower()

    def test_default_reply_is_non_empty(self):
        assert len(demo_reply([{"role": "user", "content": "hmm"}])) > 20


# ---------------- streaming ----------------
class TestStreamReply:
    def test_no_key_uses_demo(self):
        out = "".join(stream_reply([{"role": "user", "content": "I feel anxious"}], None, None))
        assert "breath" in out.lower()

    def test_streams_model_chunks_and_sends_context(self):
        client = _FakeClient(chunks=["Take ", "a slow ", "breath."])
        out = "".join(stream_reply(
            [{"role": "user", "content": "help"}],
            {"index": 50.0, "category": "Medium"}, "key", "test-model", client=client,
        ))
        assert out == "Take a slow breath."
        kw = client.messages.kwargs
        assert kw["model"] == "test-model" and kw["max_tokens"] > 0
        assert "Medium" in kw["system"] and kw["messages"][0]["role"] == "user"

    @pytest.mark.skipif(anthropic is None or httpx is None, reason="optional live-API packages are not installed")
    def test_api_error_degrades_to_demo_with_friendly_note(self):
        err = anthropic.APIConnectionError(request=httpx.Request("POST", "https://api.anthropic.com"))
        out = "".join(stream_reply([{"role": "user", "content": "I feel anxious"}], None, "key", client=_FakeClient(error=err)))
        assert "connect" in out.lower() and "breath" in out.lower()
        assert "Traceback" not in out
