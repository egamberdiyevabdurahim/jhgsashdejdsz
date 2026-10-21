"""Port of src/engine/lessons/mock.ts (mockKindOf, mockSaturdays, satMockResult) and lessons/dtm-mock.ts (dtmSittingOf, dtmScore)."""
from __future__ import annotations

import math

from ..data import load_json
from ..dates import add_days, days_between, weekday_of
from ..js import js_round

MOCK_WINDOW_DAYS = 7
GAP, ANCHOR = 14, '2026-01-03'


def mock_kind_of(i: dict):
    def ahead(d):
        return d if d and d >= i['today'] else None

    sat = ahead(i['sat']['due']) if i['sat']['bound'] else None
    dtm = ahead(i['dtm']['due']) if i['dtm']['path'] else None
    if sat and dtm:
        return 'sat' if sat <= dtm else 'dtm'
    if i['dtm']['path'] and i['dtm']['lastYear']:
        return 'dtm'
    if i['sat']['bound']:
        return 'sat'
    return 'dtm' if i['dtm']['path'] else None


def mock_saturdays(frm: str, due, n: int) -> list[str]:
    out: list[str] = []
    if due:
        last = add_days(due, -7)
        while weekday_of(last) != 6:
            last = add_days(last, -1)
        d = last
        while d >= frm:
            out.insert(0, d)
            d = add_days(d, -GAP)
        return out[:n]
    d = frm
    # ((x % GAP) + GAP) % GAP is JS's way to a non-negative remainder; Python's % already is one
    while weekday_of(d) != 6 or days_between(ANCHOR, d) % GAP != 0:
        d = add_days(d, 1)
    while len(out) < n:
        out.append(d)
        d = add_days(d, GAP)
    return out


def _section(v) -> bool:
    return isinstance(v, int) and not isinstance(v, bool) and 200 <= v <= 800 and v % 10 == 0


def sat_mock_result(s: dict, last):
    if not _section(s['rw']) or not _section(s['math']):
        return {'ok': False}
    total = s['rw'] + s['math']
    return {'ok': True, 'total': total, 'rw': s['rw'], 'math': s['math'], 'change': total - (last['rw'] + last['math']) if last else None}


# ---- dtm-mock.ts ----
_J = load_json('content/C18/mocks.json')
DTM_POINTS = _J['format']['points']
_SKILL_OF = {'ms': 'dtm_math', 'ph': 'dtm_physics', 'bi': 'dtm_biology', 'ch': 'dtm_chemistry', 'en': 'dtm_english', 'ol': 'dtm_uz_lang_lit'}


def round1(x: float) -> float:
    return js_round(x * 10 + 1e-9) / 10


def dtm_sitting_of(tracks, group: str):
    if len(tracks) != 2 or tracks[0] == tracks[1]:
        return None
    for m in _J['mocks']:
        if group not in m['groups']:
            continue
        s1 = next((b for b in m['blocks'] if b['block'] == 'subject_1'), None)
        s2 = next((b for b in m['blocks'] if b['block'] == 'subject_2'), None)
        if not s1 or not s2:
            continue
        k1, k2 = _SKILL_OF.get(s1.get('subject') or ''), _SKILL_OF.get(s2.get('subject') or '')
        first = s1 if tracks[0] == k1 and tracks[1] == k2 else s2 if tracks[0] == k2 and tracks[1] == k1 else None
        if not first:
            continue
        second = s2 if first is s1 else s1

        def items(b: dict) -> list:
            if b.get('items_by_group'):
                return b['items_by_group'].get(group) or []
            return b.get('items') or []

        comp = [next((b for b in m['blocks'] if b['block'] == bid), None) for bid in ('native', 'math_core', 'history')]
        if any(b is None for b in comp):
            return None
        blocks = [{'id': b['block'], 'name': b['name'], 'questions': b['questions'], 'points_each': b['points_each'], 'max': b['max'], 'items': items(b)} for b in comp]
        blocks.append({'id': 'subject_1', 'name': first['name'], 'questions': first['questions'], 'points_each': DTM_POINTS['subject_1'], 'max': round1(first['questions'] * DTM_POINTS['subject_1']), 'items': items(first)})
        blocks.append({'id': 'subject_2', 'name': second['name'], 'questions': second['questions'], 'points_each': DTM_POINTS['subject_2'], 'max': round1(second['questions'] * DTM_POINTS['subject_2']), 'items': items(second)})
        if any(len(b['items']) != b['questions'] for b in blocks):
            return None
        q = 0
        mx = 0
        for b in blocks:
            q += b['questions']
            mx += b['max']
        return {'mock': m['id'], 'group': group, 'blocks': blocks, 'questions': q, 'max': round1(mx)}
    return None


def dtm_score(blocks, rights) -> dict:
    out = []
    for k, b in enumerate(blocks):
        rk = rights[k] if k < len(rights) and rights[k] is not None else 0
        right = max(0, min(b['questions'], math.floor(rk)))
        out.append({'id': b['id'], 'name': b['name'], 'right': right, 'questions': b['questions'], 'points': round1(right * b['points_each']), 'max': b['max']})
    tot = 0
    for b in out:
        tot += b['points']
    mx = 0
    for b in blocks:
        mx += b['max']
    return {'blocks': out, 'total': round1(tot), 'max': round1(mx)}
