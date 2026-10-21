"""Port of src/engine/content/text.ts: the validators' text checks (normalised text, n-gram near-duplicates with MinHash, word counts, Uzbek
apostrophes, mixed-script words).

Needs the third-party `regex` module: Python's `re` has no \\p{...} classes and unicodedata has no Script property. JS-vs-Python points:
  - /i WITHOUT the u flag folds ASCII only (re.ASCII | re.IGNORECASE); /iu folds by simple case folding (ſ matches s) = regex.IGNORECASE;
  - \\b and \\w in JS are ASCII ([A-Za-z0-9_]) unless /iu; Python's are Unicode unless re.ASCII;
  - s[i] past either end is undefined in JS; Python's s[-1] is the LAST character (guarded below);
  - positions (`at`) and slices are UTF-16 offsets in JS; the content corpus holds no astral character (checked 21 Oct 2026), so code-point
    offsets are equal here. A string with an astral character would need js.utf16 offset mapping.
"""
from __future__ import annotations

import unicodedata

import regex

from ..js import JS_WS_CLASS, imul, js_trim, u32, utf16_units

APOS = regex.compile("['‘’ʻʼ`´′]")
_NOT_WORD = regex.compile(f"[^\\p{{L}}\\p{{N}}_'{JS_WS_CLASS}]+")
_WS = regex.compile(f'[{JS_WS_CLASS}]+')


def normalise(s: str) -> str:
    s = unicodedata.normalize('NFKC', s).lower()
    s = APOS.sub("'", s)
    s = regex.sub('_+', ' _ ', s)
    s = _NOT_WORD.sub(' ', s)
    s = s.replace("'", '')
    s = _WS.sub(' ', s)
    return js_trim(s)


def grams(s: str, n: int = 4) -> list[str]:
    """The n-grams in first-seen order (a JS Set iterates in insertion order)."""
    t = f' {s} '
    if len(t) <= n:
        return [t]
    seen: dict[str, None] = {}
    for i in range(len(t) - n + 1):
        seen.setdefault(t[i:i + n], None)
    return list(seen)


def jaccard(a, b) -> float:
    a, b = set(a), set(b)
    if not a and not b:
        return 1
    s, l = (a, b) if len(a) <= len(b) else (b, a)
    inter = sum(1 for g in s if g in l)
    return inter / (len(a) + len(b) - inter)


def _fnv(s: str) -> int:
    h = 0x811C9DC5
    for unit in utf16_units(s):
        h ^= unit
        h = imul(h, 0x01000193)
    return h


def _mix(h: int) -> int:
    h = u32(h)
    h ^= h >> 16
    h = imul(h, 0x85EBCA6B)
    h ^= h >> 13
    h = imul(h, 0xC2B2AE35)
    h ^= h >> 16
    return h


SEEDS = [_mix(0x9E3779B9 + i * 0x632BE5AB) for i in range(64)]


def similar_pairs(texts, threshold: float, n: int = 4) -> list[dict]:
    sets = [grams(normalise(t), n) for t in texts]
    buckets: dict[str, list[int]] = {}
    for idx, gs in enumerate(sets):
        sig = [0xFFFFFFFF] * len(SEEDS)
        for g in gs:
            h = _fnv(g)
            for k in range(len(SEEDS)):
                v = _mix(h ^ SEEDS[k])
                if v < sig[k]:
                    sig[k] = v
        for b in range(16):
            key = f"{b}:{','.join(str(x) for x in sig[b * 4:b * 4 + 4])}"
            buckets.setdefault(key, []).append(idx)
    seen: set[str] = set()
    out = []
    for lst in buckets.values():
        if len(lst) < 2:
            continue
        for x in range(len(lst)):
            for y in range(x + 1, len(lst)):
                i, j = lst[x], lst[y]
                key = f'{i},{j}' if i < j else f'{j},{i}'
                if key in seen:
                    continue
                seen.add(key)
                sim = jaccard(sets[i], sets[j])
                if sim >= threshold:
                    out.append({'i': min(i, j), 'j': max(i, j), 'sim': sim})
    out.sort(key=lambda p: (p['i'], p['j']))
    return out


_LN = regex.compile(r'[\p{L}\p{N}]')


def word_count(s: str) -> int:
    return sum(1 for w in _WS.split(s) if _LN.search(w))


_ENGLISH_HOLDING = regex.compile(r"^(?:o'clock|ma'am|y'all|ne'er|e'er|o'er|rock'n'roll|hallowe'en|fo'c'sle)\Z", regex.ASCII | regex.IGNORECASE)
_BEFORE = regex.compile("[A-Za-z'’ʼ]*\\Z")
_AFTER = regex.compile("^[A-Za-z'’ʼ]*")
_ENDING = regex.compile(r'^(s|d|re|ve|ll)\b', regex.ASCII | regex.IGNORECASE)
_T = regex.compile(r'^t\b', regex.ASCII | regex.IGNORECASE)
_M = regex.compile(r'^m\b', regex.ASCII | regex.IGNORECASE)
_N_END = regex.compile(r'n\Z', regex.ASCII | regex.IGNORECASE)
_I_ONLY = regex.compile(r'^i\Z', regex.ASCII | regex.IGNORECASE)


def _english_word_at(s: str, at: int) -> bool:
    before = _BEFORE.search(s[:at]).group(0)
    rest = s[at + 1:]
    after = _AFTER.search(rest).group(0)
    if _ENDING.search(rest) or (_T.search(rest) and _N_END.search(before)) or (_M.search(rest) and _I_ONLY.search(before)):
        return True
    if _ENGLISH_HOLDING.search(regex.sub('[’ʼ]', "'", f"{before}'{after}")):
        return True
    return before == 'O' and bool(regex.search(r'^[A-Z][a-z]', after))


_QUOTED = regex.compile('«[^»]*»|"[^"]*"|“[^”]*”')
_LETTER_MARK = regex.compile("(\\p{L})(['‘’`´ʼʻ])")
_LATIN = regex.compile(r'\p{Script=Latin}')
_CYRILLIC = regex.compile(r'\p{Script=Cyrillic}')
_L = regex.compile(r'\p{L}')


def _at(s: str, i: int) -> str:
    """s[i] ?? '' (JS: undefined outside the string, never wraps around)."""
    return s[i] if 0 <= i < len(s) else ''


def uz_apostrophes(s: str) -> list[dict]:
    out = []
    quoted = [(m.start(), m.end()) for m in _QUOTED.finditer(s)]

    def english(at: int) -> bool:
        return any(a < at < b for a, b in quoted) or _english_word_at(s, at)

    for m in _LETTER_MARK.finditer(s):
        letter, mark = m.group(1), m.group(2)
        at = m.start() + len(letter)
        fragment = s[max(0, m.start() - 6):min(len(s), at + 7)]
        if english(at):
            continue
        if letter in 'oOgG':
            if mark != 'ʻ':
                out.append({'at': at, 'found': mark, 'fragment': fragment, 'kind': 'okina'})
        elif mark != 'ʼ' and _LATIN.search(letter) and _L.search(_at(s, at + 1)):
            out.append({'at': at, 'found': mark, 'fragment': fragment, 'kind': 'tutuq'})
    return out


_UZ_WORDS_LIKE_ENGLISH = {'taʼm', 'Taʼm', 'TAʼM'}
_ENGLISH_BY_APOSTROPHE = regex.compile('^\\p{Script=Latin}+[ʼʻ’](?:s|t|d|re|ve|ll|m)\\Z|^\\p{Script=Latin}*s[ʼʻ’]\\Z|^[ʼʻ’]s\\Z')
_OG_OKINA = regex.compile('[oOgG]ʻ')
_WORDS_WITH_MARKS = regex.compile('[\\p{L}\\p{M}ʼʻ’]*[ʼʻ’][\\p{L}\\p{M}ʼʻ’]*')
_UZ_MARK = regex.compile('[ʼʻ]')


def _english_by_apostrophe(w: str) -> bool:
    return w not in _UZ_WORDS_LIKE_ENGLISH and not _OG_OKINA.search(w) and bool(_ENGLISH_BY_APOSTROPHE.search(w))


def english_with_uzbek_mark(s: str) -> list[str]:
    return [w for w in (m.group(0) for m in _WORDS_WITH_MARKS.finditer(s)) if _UZ_MARK.search(w) and _english_by_apostrophe(w)]


_STRAY = regex.compile("['‘`]")


def stray_uz_quote_marks(s: str) -> list[str]:
    out = _STRAY.findall(s)
    for m in _WORDS_WITH_MARKS.finditer(s):
        w = m.group(0)
        if '’' in w and w != '’' and not _english_by_apostrophe(w):
            out.append(w)
    return out


_QUOTE_MARKS = regex.compile("['‘’`]")
_ASCII_LETTER = regex.compile('[A-Za-z]')
_S_I = regex.compile('s', regex.ASCII | regex.IGNORECASE)
_ENDING_U = regex.compile(r'^(s|t|d|re|ve|ll|m)(?!\p{L})', regex.IGNORECASE)


def uz_stray_marks(s: str) -> list[dict]:
    out = []
    for m in _QUOTE_MARKS.finditer(s):
        at = m.start()
        prev, nxt = _at(s, at - 1), _at(s, at + 1)
        english = m.group(0) == '’' and (
            (bool(_ASCII_LETTER.search(prev)) and (_english_word_at(s, at) or (bool(_S_I.search(prev)) and not _L.search(nxt))))
            or (not _L.search(prev) and bool(_ENDING_U.search(s[at + 1:]))))
        if not english:
            out.append({'at': at, 'found': m.group(0), 'fragment': s[max(0, at - 6):min(len(s), at + 7)]})
    return out


_SPLIT_WORDS = regex.compile('[^\\p{L}ʻʼ]+')


def mixed_script_words(s: str) -> list[str]:
    return [w for w in _SPLIT_WORDS.split(s) if _LATIN.search(w) and _CYRILLIC.search(w)]


def codepoint(c: str) -> str:
    return f'U+{ord(c[0]):04X}'
