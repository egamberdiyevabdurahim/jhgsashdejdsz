"""Port of src/engine/lessons/levels.ts: a lesson skill's level (Boshlandi -> Tanish -> Bilaman -> Puxta) after each sitting, and its words."""
from __future__ import annotations

import math

from ..dates import days_between

LEVELS = ('started', 'familiar', 'proficient', 'mastered')
PASS_NUM, PASS_DEN, PASS_MIN, MASTERY_GAP_DAYS, MASTERY_RIGHTS, FALL_RUN = 2, 3, 2, 3, 2, 2
KEEP_PASSES = 6
NEW_SKILL = {'level': None, 'passes': [], 'miss_run': 0, 'proficient_on': None, 'mastered_on': None, 'down_on': None, 'mixed_right': 0}


def pass_line(n: int) -> int:
    return math.ceil((n * PASS_NUM) / PASS_DEN)


def is_pass(right: int, of: int) -> bool:
    return of >= PASS_MIN and right >= pass_line(of)


def _down(level: str) -> str:
    return LEVELS[max(LEVELS.index(level) - 1, 0)]


def _ok(a: dict) -> bool:
    return bool(a.get('ok')) and not a.get('dontknow')


def apply_sitting(s0: dict, sitting: dict) -> dict:
    counted = [a for a in sitting['answers'] if not a.get('repeat')]
    day = sitting['day']
    right = sum(1 for a in counted if _ok(a))
    of = len(counted)
    passed = is_pass(right, of)
    frm = s0['level']
    if not of:
        return {'state': s0, 'from': frm, 'to': frm, 'right': right, 'of': of, 'pass': False, 'why': 'none'}
    s = {**s0, 'passes': list(s0['passes'])}
    why = 'stay'
    if s['level'] is None:
        s['level'] = 'started'
        why = 'start'
    if passed:
        earlier = any(d != day for d in s['passes'])
        if s['level'] == 'started':
            s['level'] = 'familiar'
            why = 'pass'
        elif s['level'] == 'familiar' and earlier:
            s['level'] = 'proficient'
            s['proficient_on'] = day
            s['mixed_right'] = 0
            why = 'second_day'
        if day not in s['passes']:
            s['passes'] = [*s['passes'], day][-KEEP_PASSES:]
        s['miss_run'] = 0
    elif sitting['kind'] != 'test_out':
        for a in counted:
            if _ok(a):
                s['miss_run'] = 0
                continue
            s['miss_run'] += 1
            if s['miss_run'] >= FALL_RUN and s['level'] != 'started' and s['down_on'] != day:
                was = s['level']
                s['level'] = _down(was)
                s['down_on'] = day
                s['miss_run'] = 0
                why = 'fall'
                if was == 'mastered':
                    s['mastered_on'] = None
                if was == 'proficient':
                    s['proficient_on'] = None
                    s['mixed_right'] = 0
    if sitting['kind'] == 'unit_test' and passed and s0['level'] == 'proficient' and s['proficient_on'] and days_between(s['proficient_on'], day) >= MASTERY_GAP_DAYS:
        s['level'] = 'mastered'
        s['mastered_on'] = day
        why = 'unit_test'
    if s['level'] == 'proficient' and s['proficient_on'] and days_between(s['proficient_on'], day) >= MASTERY_GAP_DAYS and why != 'fall':
        s['mixed_right'] += sum(1 for a in counted if a.get('mixed') and _ok(a))
        if s['mixed_right'] >= MASTERY_RIGHTS:
            s['level'] = 'mastered'
            s['mastered_on'] = day
            why = 'mixed'
    if why == 'start' and s['level'] != 'started':
        why = 'pass'
    return {'state': s, 'from': frm, 'to': s['level'], 'right': right, 'of': of, 'pass': passed, 'why': why}


NAMES = {
    'started': {'en': 'Started', 'uz': 'Boshlandi', 'ru': 'Начато'},
    'familiar': {'en': 'Familiar', 'uz': 'Tanish', 'ru': 'Знакомо'},
    'proficient': {'en': 'Proficient', 'uz': 'Bilaman', 'ru': 'Умею'},
    'mastered': {'en': 'Mastered', 'uz': 'Puxta', 'ru': 'Освоено'},
}


def level_name(level: str | None, lang: str) -> str:
    return NAMES[level or 'started'][lang]


def level_dots(level: str | None) -> str:
    n = LEVELS.index(level) + 1 if level else 0
    return '●' * n + '○' * (4 - n)


WHY = {
    'second_day': {'en': 'passed on a second day too', 'uz': 'ikkinchi kun ham oʻtdingiz', 'ru': 'сдано и во второй день'},
    'mixed': {'en': 'right again later', 'uz': 'keyin ham toʻgʻri yechdingiz', 'ru': 'верно и позже'},
    'unit_test': {'en': 'unit test passed', 'uz': 'mavzu testidan oʻtdingiz', 'ru': 'тест по теме сдан'},
    'fall': {'en': f'{FALL_RUN} misses in a row', 'uz': f'ketma-ket {FALL_RUN} ta xato', 'ru': f'{FALL_RUN} ошибки подряд'},
}


def skill_line(r: dict, unit: str, lang: str) -> str:
    to = r.get('to') or 'started'
    frm = r.get('from') or 'started'
    if frm != to:
        w = WHY.get(r['why'])
        return f"{unit}: {level_name(frm, lang)} → {level_name(to, lang)}{f' ({w[lang]})' if w else ''}"
    n = level_name(to, lang)
    score = f"{r['right']}/{r['of']}"
    if lang == 'uz':
        return f'{unit}: {n} qoldi (bugun shu mavzudan {score})'
    if lang == 'ru':
        return f'{unit}: осталось «{n}» (сегодня по этой теме {score})'
    return f'{unit}: still {n} (today on this topic {score})'


HINT = {
    'started': {'en': '2/3 on this topic: Familiar', 'uz': 'Shu mavzudan 2/3 boʻlsa — Tanish', 'ru': '2/3 по этой теме — и будет «Знакомо»'},
    'familiar': {'en': '3/4 on this topic: Proficient', 'uz': 'Shu mavzudan 3/4 boʻlsa — Bilaman', 'ru': '3/4 по этой теме — и будет «Умею»'},
    'proficient': {'en': 'Two right answers on it in later sets: Mastered', 'uz': 'Keyingi vazifalarda shu mavzudan 2 ta toʻgʻri javob — Puxta',
                   'ru': 'Ещё 2 верных ответа по теме в следующих заданиях — «Освоено»'},
}


def next_hint(level: str | None, lang: str):
    h = HINT.get(level or 'started')
    return h.get(lang) if h else None


def course_line(c: dict, lang: str) -> str:
    word = 'dars' if lang == 'uz' else 'уроков' if lang == 'ru' else 'lessons'
    head = f"{c['title']} · {c['done']}/{c['of']} {word}"
    sec = c.get('section')
    if not sec:
        return head
    title, k, n = sec['title'], sec['proficient'], sec['of']
    lv = level_name('proficient', lang)
    if lang == 'uz':
        return f'{head} · {title}: {n} mavzudan {k} tasi {lv} darajasida'
    if lang == 'ru':
        return f"{head} · {title}: {k} из {n} {'темы' if n % 10 == 1 and n % 100 != 11 else 'тем'} на уровне «{lv}»"
    return f"{head} · {title}: {k} of {n} {'topic' if n == 1 else 'topics'} at {lv}"
