"""Port of src/engine/endings.ts: how a task ends (done / tried / skipped), real answers, profile pay, a day's count.

JS-vs-Python points taken here: \\s is JS's whitespace set (js.JS_WS_CLASS), trim() is js_trim, [\\p{L}\\p{N}] is a Unicode general-category
test (Python's `re` has no \\p{...}), /i on an ASCII pattern without the u flag never folds a non-ASCII letter (re.ASCII | re.IGNORECASE).
Unicode tables: V8's ICU and Python's unicodedata may be on different Unicode versions (letters added later differ)."""
from __future__ import annotations

import math
import re
import unicodedata

from .js import JS_WS_CLASS, js_round, js_trim, truthy

ENDINGS = ('done', 'tried', 'skipped')
TRIED_COINS = 0
_WS_RUN = re.compile(f'[{JS_WS_CLASS}]+')


def is_ending(s) -> bool:
    return s in ('done', 'tried', 'skipped') and isinstance(s, str)


def _letter_or_number(c: str) -> bool:
    return unicodedata.category(c)[0] in ('L', 'N')


def real_text(v) -> bool:
    if not isinstance(v, str):
        return False
    s = _WS_RUN.sub('', v)
    marks = sum(1 for c in s if _letter_or_number(c))
    return marks >= 2 and len(set(s.lower())) >= 2


TYPED = ('text', 'text_or_voice')
LISTS_SHE_BUILDS = ('repeatable', 'table', 'repeatable_autocomplete')


def _qtype(q) -> str:
    t = q.get('type') if q else None
    return '' if t is None else t


def _typed(q) -> bool:
    if not q:
        return False
    t = _qtype(q)
    opts = q.get('options')
    return t in TYPED or ((t == 'select' or t == 'multi') and not (isinstance(opts, list) and len(opts) > 0))


class _Undef:
    pass


UNDEF = _Undef()


def real_answer(v, q=None) -> bool:
    if v is UNDEF or v is None or v == 'skipped' and isinstance(v, str) or (isinstance(v, str) and v == ''):
        return False
    if isinstance(v, list) and not v:
        return bool(q) and _qtype(q) in LISTS_SHE_BUILDS
    if isinstance(v, list):
        return any(real_text(x) for x in v) if _typed(q) else len(v) > 0
    if isinstance(v, str):
        return real_text(v) if _typed(q) else len(js_trim(v)) > 0
    if isinstance(v, dict):
        return len(v) > 0
    return True


_OPTIONAL = re.compile(r'\(optional\)', re.ASCII | re.IGNORECASE)


def optional_q(q) -> bool:
    if not q:
        return False
    te = q.get('text_en')
    return q.get('sensitive') is True or bool(_OPTIONAL.search('' if te is None else te))


def counts_answered(v, q=None) -> bool:
    return real_answer(v, q) or (isinstance(v, str) and v == 'skipped' and optional_q(q))


def profile_pay(coins: float, answered: float, asked: float) -> dict:
    of = max(0, math.floor(asked))
    n = max(0, min(of, math.floor(answered)))
    if of == 0 or n * 2 < of:
        return {'ending': 'skipped', 'coins': 0}
    return {'ending': 'done', 'coins': max(0, math.floor((coins * n) / of / 5) * 5)}


def day_count(tasks) -> dict:
    req = [t for t in tasks if not truthy(t.get('optional')) and t['status'] != 'replaced']

    def n(s: str) -> int:
        return sum(1 for t in req if t['status'] == s)

    done, tried, skipped, started = n('done'), n('tried'), n('skipped'), len(req)
    of = started
    open_ = started - done - tried - skipped
    return {
        'done': done, 'tried': tried, 'skipped': skipped, 'open': open_, 'of': of, 'started': started,
        'percent': js_round((done * 100) / started) if started > 0 else 0,
        'bonus': started > 0 and done == started,
        'kept': done + tried > 0,
        'left': {'again': tried, 'todo': open_, 'skipped': skipped},
    }
