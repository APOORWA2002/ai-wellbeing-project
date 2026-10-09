"""Crisis detection and support resources for the chat companion.

Crisis messages are handled by this module with a fixed, reviewed response
instead of being left to the language model. Keyword matching is a safety net,
not a clinical tool: it can miss indirect wording, which is why the chat UI also
shows the helpline permanently.
"""

from __future__ import annotations

import re
from typing import List, Tuple

# (number, name, note). Edit here if the numbers change or you deploy elsewhere.
HELPLINES: List[Tuple[str, str, str]] = [
    ("1926", "National Mental Health Helpline", "free, 24/7, English / Sinhala / Tamil"),
    ("1333", "CCC Line (Community Crisis Response)", "emotional support"),
    ("011 269 2909", "Sri Lanka Sumithrayo", "emotional support, Colombo"),
    ("119", "Police emergency", "if you or someone else is in immediate danger"),
]

SHORT_HELP_LINE = "In crisis? Call 1926 (free, 24/7)."

_CRISIS_PATTERNS = [
    r"\bsuicid",
    r"\bkill (myself|me)\b",
    r"\bend (my|your|this) life\b",
    r"\bend my own life\b",
    r"\bend it all\b",
    r"\btake my (own )?life\b",
    r"\bwant(ed)? to die\b",
    r"\bwish (i|that i) (was|were) dead\b",
    r"\bbetter off dead\b",
    r"\bnot worth living\b",
    r"\bdo(n't| not) want to (live|be alive|exist|be here)\b",
    r"\bno (reason|point) (in |to )?(living|live|going on|go on)\b",
    r"\bself[- ]?harm",
    r"\b(hurt|harm|cut|injure|hurting|harming|cutting) (myself|my self)\b",
    r"\bcan'?t go on\b",
]
_CRISIS_RE = re.compile("|".join(_CRISIS_PATTERNS), re.IGNORECASE)


def detect_crisis(text: str) -> bool:
    """Return True if the message contains language suggesting self-harm or suicide."""
    if not text:
        return False
    normalized = text.replace("\u2019", "'").replace("\u2018", "'")
    return bool(_CRISIS_RE.search(normalized))


def crisis_message() -> str:
    """Fixed, compassionate response shown instead of a model reply."""
    lines = "\n".join(f"- **{num}** \u2014 {name} ({note})" for num, name, note in HELPLINES)
    return (
        "I'm really glad you told me, and I'm concerned about how much pain you're in. "
        "You don't have to carry this alone, and talking to a real person right now can help.\n\n"
        f"{lines}\n\n"
        "If you are in immediate danger, call **119** or go to the nearest hospital emergency "
        "department. If someone you trust is nearby, such as a friend, family member or lecturer, "
        "please tell them how you're feeling.\n\n"
        "I'm still here to talk, but I'm an AI and can't replace the support those people can give. "
        "(If you're outside Sri Lanka, please call your local emergency number.)"
    )
