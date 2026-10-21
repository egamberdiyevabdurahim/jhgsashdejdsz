"""Port of src/server/lessons/hw-plan.ts (pure): a homework set's plan, its first-try score and pay, its status, its words and result card."""
from __future__ import annotations

import math

from ..coins import TASK_COINS
from .levels import skill_line

HW_MAX = 10
HW_LESSONS = 4
HW_MIN_PER = 2
HW_ATTENTION_MISSING = 2


def quiz_pass_mark(of: int) -> int:
    """src/engine/tasks.ts quizPassMark: two-thirds, rounded up."""
    return math.ceil((2 * of) / 3)


def plan_set(lessons, have: dict) -> dict:
    take = list(lessons[:HW_LESSONS])
    spill = [l['id'] for l in lessons[HW_LESSONS:]]
    k = len(take)

    def each(l: dict) -> int:
        return (2 if l.get('testOut') else 4) if k == 1 else 3 if k == 2 else 2

    per = [{'lesson': l['id'], 'skill': l['skill'], 'n': each(l)} for l in take]
    want = {'recent': 2 if k == 1 else 0, 'due': 2}
    carried = max(0, min(have['carried'], HW_MAX - HW_MIN_PER * k))
    room = HW_MAX - carried - sum(p['n'] for p in per)
    for p in per:
        while room < 0 and p['n'] > HW_MIN_PER:
            p['n'] -= 1
            room += 1
    recent = max(0, min(want['recent'], have['recent'], room))
    room -= recent
    due = max(0, min(want['due'], have['due'], room))
    return {'per': per, 'recent': recent, 'due': due, 'carried': carried, 'spill': spill}


def first_try(items) -> dict:
    scored = [i for i in items if not i.get('repeat')]
    return {'right': sum(1 for i in scored if i.get('first_ok') is True), 'of': len(scored)}


def hw_pass(s: dict) -> bool:
    return s['of'] > 0 and s['right'] >= quiz_pass_mark(s['of'])


def hw_coins(s: dict, items: int) -> int:
    if not hw_pass(s):
        return 0
    return TASK_COINS['quiz_long'] if items > TASK_COINS['quiz_long_over'] else TASK_COINS['quiz']


def to_correct(items) -> list:
    return [i for i in items if i.get('first_ok') is False and i.get('corrected_ok') is not True and not i.get('review')]


def hw_status(t: dict, for_day: str, today: str) -> str:
    done = len(t['items']) > 0 and all(i.get('first_ok') is not None for i in t['items'])
    if not done:
        return 'missing' if today > for_day else 'assigned'
    return 'handed_in' if to_correct(t['items']) else 'complete'


def _ru_q(n: int) -> str:
    if n % 10 == 1 and n % 100 != 11:
        return 'вопрос'
    if 2 <= n % 10 <= 4 and (n % 100 < 12 or n % 100 > 14):
        return 'вопроса'
    return 'вопросов'


def hw_words(lang: str, n: int) -> dict:
    if lang == 'uz':
        return {'title': f'Uy vazifasi · {n} savol', 'instructions': 'Oxirgi darslaringizdan savollar. Har javobdan keyin toʻgʻri javob va izohi chiqadi. Birinchi urinish hisoblanadi; xatoni oʻxshash savol bilan tuzatasiz.'}
    if lang == 'ru':
        return {'title': f'Домашнее задание · {n} {_ru_q(n)}', 'instructions': 'Вопросы по последним урокам. После каждого ответа видно верный ответ и почему. Считается первая попытка; ошибку вы исправите на похожем вопросе.'}
    return {'title': f'Homework · {n} questions', 'instructions': 'Questions on your last lessons. After each answer you see the right one and why. Your first try is the score; you fix a miss on a similar question.'}


def _tri(f) -> dict:
    return {'en': f('en'), 'uz': f('uz'), 'ru': f('ru')}


def hw_card(i: dict) -> dict:
    score, need = f"{i['right']}/{i['of']}", quiz_pass_mark(i['of'])
    coins = i['coins']
    if i['pass']:
        one = _tri(lambda l: f'Birinchi urinishda {score} · +{coins} tanga' if l == 'uz' else f'С первой попытки {score} · +{coins} монет' if l == 'ru' else f'First try {score} · +{coins} coins')
    else:
        one = _tri(lambda l: f'Birinchi urinishda {score} · tanga yoʻq ({need} ta kerak edi) · streak saqlandi' if l == 'uz'
                   else f'С первой попытки {score} · без монет (нужно {need}) · серия сохранена' if l == 'ru' else f'First try {score} · no coins ({need} needed) · streak kept')
    moved = [m for m in i['moves'] if m.get('from') != m.get('to')]
    stay = [m for m in i['moves'] if m.get('lesson')] if i['pass'] else []
    skills = [_tri(lambda l, m=m: skill_line(m, m['unit'][l], l)) for m in (moved or stay)]
    if not skills:
        skills.append({'en': 'Skills did not change', 'uz': 'Koʻnikmalar oʻzgarmadi', 'ru': 'Навыки не изменились'})
    left = i['left']

    def nxt(l: str) -> str:
        fix = f'{left} ta tuzatish qoldi.' if l == 'uz' else f'Осталось исправить: {left}.' if l == 'ru' else f'{left} left to fix.'
        if not i['pass']:
            back = 'Xatolar Takrorlashda qaytadi' if l == 'uz' else 'Ошибки вернутся в «Повторении»' if l == 'ru' else 'The mistakes come back in Review'
            return f'{fix} {back}' if left else back
        if left:
            tail = 'Tanga bermaydi, lekin vazifa «Bajarildi» boʻladi' if l == 'uz' else 'Монет за это нет, но задание станет «Выполнено»' if l == 'ru' else 'No coins for them, but the homework becomes Complete'
            return f'{fix} {tail}'
        return 'Vazifa «Bajarildi»' if l == 'uz' else 'Задание «Выполнено»' if l == 'ru' else 'The homework is Complete'

    return {'one': one, 'skills': skills, 'next': _tri(nxt)}


def needs_attention(rows, today: str, week_ago: str) -> bool:
    return sum(1 for r in rows if r['status'] == 'missing' and week_ago < r['forDay'] < today) >= HW_ATTENTION_MISSING
