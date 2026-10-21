"""Port of src/engine/content/typed.ts: a typed IELTS answer (normal form, word limit, right or wrong, what the gap already prints).

JS-vs-Python points taken here: `$` without the m flag is end-of-input (Python `\\Z`; Python's `$` also matches before a final newline);
JS \\d is [0-9] (Python's \\d matches every Unicode digit); \\s is JS's whitespace set; String.length is UTF-16 units (utf16_len);
NFKC and toLowerCase follow each runtime's Unicode tables."""
from __future__ import annotations

import re
import unicodedata

from ..js import JS_WS_CLASS, js_trim, utf16_len

TYPED_MAX = 120
_PUNCT = '.,;:!?"«»“”„()\\[\\]'
OUTER = re.compile(f'^[{JS_WS_CLASS}{_PUNCT}]+|[{JS_WS_CLASS}{_PUNCT}]+\\Z')
SIGN = re.compile(r'^[£$€](?=[0-9])|(?<=[0-9])[£$€]\Z')
WHOLE = re.compile(r'^([0-9]+)[.,]00\Z')
_QUOTES = re.compile('[‘’ʼ`´]')
_SPACES_DASHES = re.compile(f'[{JS_WS_CLASS}‐-―-]+')
_WS_SPLIT = re.compile(f'[{JS_WS_CLASS}]+')


def norm_typed(s: str) -> str:
    s = unicodedata.normalize('NFKC', s).lower()
    s = _QUOTES.sub("'", s)
    s = OUTER.sub('', s)
    s = _SPACES_DASHES.sub('', s)
    s = SIGN.sub('', s)
    return WHOLE.sub(r'\1', s, count=1)


NUMBER_TOKEN = re.compile(r'^[£$€]?[0-9][0-9.,:/]*[%£$€]?\Z')
_BARE = re.compile('^[("\'«“\\[]+|[)"\'»”\\].,;:!?]+\\Z')
_SIGN_ONLY = re.compile(r'^[£$€]\Z')


def _bare(t: str) -> str:
    return _BARE.sub('', t)


def _split_ws(s: str) -> list[str]:
    """s.split(/\\s+/) after a trim: '' gives [''] in JS, which the caller's filter(Boolean) drops."""
    return _WS_SPLIT.split(s)


def within_limit(s: str, lim: dict) -> bool:
    words = 0
    numbers = 0
    for t in [x for x in (_bare(t) for t in _split_ws(js_trim(unicodedata.normalize('NFKC', s)))) if x]:
        if _SIGN_ONLY.match(t):
            continue
        if lim['number'] and numbers == 0 and NUMBER_TOKEN.match(t):
            numbers += 1
        else:
            words += 1
    return words <= lim['words']


def typed_right(answer, accept, lim: dict) -> bool:
    if not isinstance(answer, str) or utf16_len(answer) > TYPED_MAX:
        return False
    a = norm_typed(answer)
    return bool(a) and within_limit(answer, lim) and any(norm_typed(x) == a for x in accept)


SIGN_WORDS = {'£': ('pound', 'pounds', 'gbp', 'quid'), '$': ('dollar', 'dollars', 'usd'), '€': ('euro', 'euros', 'eur'), '%': ('percent', 'per', 'cent')}
_GAP = re.compile('_{3,}')
_SIGN_BEFORE = re.compile(f'([£$€%])[{JS_WS_CLASS}]*\\Z')
_SIGN_AFTER = re.compile(f'^[{JS_WS_CLASS}]*([£$€%])')


def _is_letter(c: str) -> bool:
    return unicodedata.category(c)[0] == 'L'


def printed_extra(answer, accept, stem: str):
    if not isinstance(answer, str) or not js_trim(answer) or utf16_len(answer) > TYPED_MAX:
        return None
    line = next((l for l in stem.split('\n') if _GAP.search(l)), None)
    if line is None:
        return None
    parts = _GAP.split(unicodedata.normalize('NFKC', line))
    before = parts[0] if len(parts) > 0 else ''
    after = parts[1] if len(parts) > 1 else ''

    def near(s: str) -> list[str]:
        return [x for x in (_bare(t) for t in _split_ws(js_trim(s))) if x]

    b, f = near(before), near(after)
    printed: dict[str, str] = {}
    for w in [*b[-2:], *f[:2]]:
        if any(_is_letter(c) for c in w):
            printed[norm_typed(w)] = w
    m = _SIGN_BEFORE.search(before)
    sign = m.group(1) if m else None
    if sign is None:
        m2 = _SIGN_AFTER.search(after)
        sign = m2.group(1) if m2 else None
    if sign:
        for w in [sign, *SIGN_WORDS[sign]]:
            printed[w] = sign
    named = None
    kept = []
    for t in _split_ws(js_trim(unicodedata.normalize('NFKC', answer))):
        p = printed.get(norm_typed(t))
        if p is None:
            kept.append(t)
            continue
        named = p if named is None else named
    if not named or not kept:
        return None
    rest = norm_typed(' '.join(kept))
    return named if any(norm_typed(x) == rest for x in accept) else None
