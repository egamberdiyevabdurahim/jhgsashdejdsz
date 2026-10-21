"""Port of src/engine/learner/elo.ts: Elo difficulty targeting, K decay, Khan-like mastery states. Pure: no clock, no store."""
from __future__ import annotations

from ..js import js_exp, js_max, js_min


def logistic(x: float) -> float:
    return 1 / (1 + js_exp(-x))


ELO_SKILL_K = {'k0': 1, 'decay': 0.1, 'min': 0.05}
ELO_ITEM_K = {'k0': 0.1, 'decay': 0.05, 'min': 0.01}
ELO_LIMIT = 6
GUESS_MC = 0.25


def k_of(answers: float, rule: dict = ELO_SKILL_K) -> float:
    return js_max(rule['min'], rule['k0'] / (1 + rule['decay'] * js_max(0, answers)))


def p_correct(theta: float, b: float, guess: float = 0) -> float:
    return guess + (1 - guess) * logistic(theta - b)


def _clamp(v: float) -> float:
    return js_max(-ELO_LIMIT, js_min(ELO_LIMIT, v))


def elo_update(skill: dict, item: dict, ok: bool, guess: float = 0) -> dict:
    p = p_correct(skill['theta'], item['b'], guess)
    d = (1 if ok else 0) - p
    return {'p': p, 'theta': _clamp(skill['theta'] + k_of(skill['answers']) * d), 'b': _clamp(item['b'] - k_of(item['answers'], ELO_ITEM_K) * d)}


MASTERY = ('attempted', 'familiar', 'proficient', 'mastered')
MASTERY_RULES = {'familiar': {'p': 0.6, 'answers': 5}, 'proficient': {'p': 0.75, 'answers': 10}, 'mastered': {'p': 0.9, 'answers': 20}}


def mastery_of(theta: float, answers: int, ref: float) -> str | None:
    if answers < 1:
        return None
    p = logistic(theta - ref)
    for m in ('mastered', 'proficient', 'familiar'):
        if p >= MASTERY_RULES[m]['p'] and answers >= MASTERY_RULES[m]['answers']:
            return m
    return 'attempted'


def at_least_proficient(m: str | None) -> bool:
    return m in ('proficient', 'mastered')


def credited(theta: float, ref: float) -> bool:
    return logistic(theta - ref) >= MASTERY_RULES['proficient']['p']


def skill_at(row: dict, theta: float, o: dict) -> dict:
    answers = row['answers'] + (1 if o['answered'] else 0)
    mastery = mastery_of(theta, answers, o['ref'])
    prof = row.get('proficientAt')
    if prof is None:
        prof = o['at'] if at_least_proficient(mastery) else None
    return {'theta': theta, 'answers': answers, 'mastery': mastery, 'proficientAt': prof}
