"""Chat companion logic: prompt building, Anthropic streaming, and offline demo mode.

This module has no Streamlit dependency so it can be unit-tested without a UI or
network access.
"""

from __future__ import annotations

import os
import re
from typing import Any, Dict, Iterator, List, Mapping, Optional

DEFAULT_MODEL = "claude-haiku-5-5"
MAX_HISTORY = 20          # messages sent to the model (cost + context control)
MAX_TOKENS = 600          # keeps replies short and cheap
MAX_INPUT_CHARS = 1000    # per user message

SYSTEM_PROMPT = """You are a calm, warm stress-relief companion inside a university well-being prototype \
(an educational project, not a medical service).

How to respond:
- Keep replies short: 2-5 sentences, plain language, no headings. Ask at most one question.
- Offer ONE practical technique at a time (slow breathing, 5-4-3-2-1 grounding, a short walk or stretch, \
a screen break, a wind-down routine, breaking a task into a tiny first step) and match it to the time the \
person says they have.
- When guiding an exercise, give numbered steps they can follow right now.
- Acknowledge feelings first, then help. Never dismiss, lecture, or moralise.
- You are an AI, never claim to be human or a therapist. Do not diagnose, name conditions, or give \
medication advice.
- If the person mentions self-harm, suicide, or being in danger, respond with care, encourage them to contact \
the Sri Lanka national mental health helpline 1926 (free, 24/7), emergency services (119), or a trusted person.
- Do not ask for names, ID numbers, or other identifying details.
- Stay on stress, wellbeing and study-life balance. If asked about unrelated topics, gently steer back.
- If assessment details are provided below, use them lightly to tailor your suggestions. They are a rough \
educational estimate, not a diagnosis, so never present them as medical facts."""


# ------------------------------------------------------------------------------
# Configuration helpers
# ------------------------------------------------------------------------------
def resolve_api_key(
    session_key: Optional[str] = None,
    secrets: Optional[Mapping[str, Any]] = None,
    env: Optional[Mapping[str, str]] = None,
) -> Optional[str]:
    """Pick the API key: pasted-in-session > Streamlit secrets > environment variable."""
    env = os.environ if env is None else env
    for candidate in (
        session_key,
        (secrets or {}).get("ANTHROPIC_API_KEY") if secrets else None,
        env.get("ANTHROPIC_API_KEY"),
    ):
        if candidate and str(candidate).strip():
            return str(candidate).strip()
    return None


def resolve_model(
    secrets: Optional[Mapping[str, Any]] = None,
    env: Optional[Mapping[str, str]] = None,
) -> str:
    env = os.environ if env is None else env
    value = ((secrets or {}).get("ANTHROPIC_MODEL") if secrets else None) or env.get("ANTHROPIC_MODEL")
    return str(value).strip() if value and str(value).strip() else DEFAULT_MODEL


# ------------------------------------------------------------------------------
# Prompt / message preparation
# ------------------------------------------------------------------------------
def build_system_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Append the user's latest assessment (if they chose to share it) to the system prompt."""
    if not context:
        return SYSTEM_PROMPT
    parts = []
    if context.get("index") is not None and context.get("category"):
        parts.append(f"stress index {float(context['index']):.1f}/100 ({context['category']})")
    inputs = []
    if context.get("hrv") is not None:
        inputs.append(f"HRV {float(context['hrv']):.0f} ms")
    if context.get("screen") is not None:
        inputs.append(f"screen time {float(context['screen']):.1f} h/day")
    if context.get("sleep") is not None:
        inputs.append(f"sleep {float(context['sleep']):.1f} h")
    if inputs:
        parts.append("inputs: " + ", ".join(inputs))
    if context.get("action"):
        parts.append(f"the app suggested: {context['action']}")
    if not parts:
        return SYSTEM_PROMPT
    return SYSTEM_PROMPT + "\n\nLatest assessment shared by the user (educational estimate): " + "; ".join(parts) + "."


def prepare_messages(history: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Trim history to the last MAX_HISTORY turns, keep only valid roles, and start with a user turn."""
    cleaned = [
        {"role": m["role"], "content": str(m["content"])[:MAX_INPUT_CHARS * 3]}
        for m in history
        if m.get("role") in ("user", "assistant") and str(m.get("content", "")).strip()
    ]
    cleaned = cleaned[-MAX_HISTORY:]
    while cleaned and cleaned[0]["role"] != "user":
        cleaned.pop(0)
    return cleaned


# ------------------------------------------------------------------------------
# Offline demo mode (no API key needed)
# ------------------------------------------------------------------------------
_DEMO_RULES = [
    (r"breath|panic|anxi|nervous|racing|heart|shak|tense|calm",
     "That sounds really tense, and your body is probably on high alert. Let's slow it down together with "
     "box breathing:\n\n1. Breathe in through your nose for 4 seconds\n2. Hold gently for 4\n3. Breathe out slowly "
     "for 4\n4. Hold for 4\n\nRepeat 4 rounds. How do you feel afterwards?"),
    (r"sleep|insomnia|tired|exhaust|can'?t sleep|awake|night",
     "Poor sleep makes everything feel heavier. Tonight, try a simple wind-down: put your phone away 30-60 "
     "minutes before bed, dim the lights, and do a slow body scan from your toes up to your head, relaxing each part. "
     "Would a short script for that help?"),
    (r"phone|screen|scroll|social media|instagram|tiktok|youtube|laptop|online",
     "Long screen stretches can quietly drain you. Try the 20-20-20 reset: every 20 minutes, look at something "
     "20 feet away for 20 seconds, then stand up and stretch for a minute. Want help planning screen breaks "
     "for today?"),
    (r"exam|deadline|assignment|study|test|overwhelm|too much|behind|workload|project|submit",
     "That's a lot to hold at once. Let's shrink it: write down everything on your plate, pick just ONE "
     "thing, and commit to 10 focused minutes on its first small step. Then take a 2-minute break. What's the one "
     "thing that feels most urgent?"),
    (r"lonely|alone|sad|down|cry|hopeless|empty|homesick|miss",
     "I'm sorry you're feeling this way. Those feelings are heavy, and it's okay to not be okay. Is there "
     "one person you could message today, even just to say hi? In the meantime, would you like to tell me more "
     "about what's been going on?"),
    (r"angry|frustrat|annoy|irritat|furious|mad\b",
     "Frustration is a sign something matters to you. Before reacting, try this: breathe out slowly for 6 "
     "seconds, unclench your jaw and shoulders, and name what you're feeling in one word. What set it off?"),
    (r"thank|thanks|better|helped|feel good",
     "I'm really glad that helped. Notice what shifted for you; you can come back to it any time. Is there "
     "anything else on your mind today?"),
    (r"ground|5-4-3-2-1|present|focus|distract",
     "Try 5-4-3-2-1 grounding: name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell and 1 "
     "you can taste. It pulls your attention back to the present. Tell me how it goes."),
]


def demo_reply(history: List[Dict[str, str]], context: Optional[Dict[str, Any]] = None) -> str:
    """Rule-based supportive reply used when no API key is configured (or the API fails)."""
    last = next((m["content"] for m in reversed(history) if m.get("role") == "user"), "")
    text = last.lower()
    for pattern, reply in _DEMO_RULES:
        if re.search(pattern, text):
            return reply
    tailored = ""
    if context and context.get("category") == "High":
        tailored = "Your latest assessment suggests your stress is running high, so let's keep this gentle. "
    elif context and context.get("category") == "Low":
        tailored = "Your latest assessment looks fairly balanced, which is good to hear. "
    return (
        tailored
        + "Thanks for sharing that with me. I'm here to listen. If it helps, I can guide you through a short "
        "breathing exercise, help you break down what's weighing on you, or suggest a quick reset. "
        "What would feel most useful right now?"
    )


def stream_words(text: str) -> Iterator[str]:
    """Yield text word by word so demo replies feel like a live conversation."""
    import time
    for chunk in re.findall(r"\S+\s*|\n+", text):
        yield chunk
        time.sleep(0.02)


# ------------------------------------------------------------------------------
# Live AI mode (Anthropic API)
# ------------------------------------------------------------------------------
def _friendly_error(exc: Exception) -> str:
    name = type(exc).__name__
    if name == "AuthenticationError":
        return "The API key was not accepted. Please check it and try again."
    if name == "RateLimitError":
        return "The AI service is busy right now. Please try again in a moment."
    if name in ("APIConnectionError", "APITimeoutError"):
        return "I couldn't connect to the AI service. Please check your internet connection."
    return "The AI service had a problem just now."


def stream_reply(
    history: List[Dict[str, str]],
    context: Optional[Dict[str, Any]],
    api_key: Optional[str],
    model: str = DEFAULT_MODEL,
    client: Any = None,
) -> Iterator[str]:
    """Stream a reply from the model. Falls back to demo mode if no key or on any API error."""
    if client is None and not api_key:
        yield from stream_words(demo_reply(history, context))
        return

    messages = prepare_messages(history)
    if not messages:
        yield from stream_words(demo_reply(history, context))
        return

    try:
        if client is None:
            import anthropic  # imported lazily so demo mode works without the package
            client = anthropic.Anthropic(api_key=api_key, timeout=30.0, max_retries=1)
        with client.messages.stream(
            model=model,
            max_tokens=MAX_TOKENS,
            system=build_system_prompt(context),
            messages=messages,
        ) as stream:
            for piece in stream.text_stream:
                yield piece
    except ImportError:
        yield from stream_words(demo_reply(history, context))
    except Exception as exc:  # noqa: BLE001 - any API failure should degrade gracefully
        yield f"{_friendly_error(exc)} In the meantime, here is something that may help:\n\n"
        yield from stream_words(demo_reply(history, context))
