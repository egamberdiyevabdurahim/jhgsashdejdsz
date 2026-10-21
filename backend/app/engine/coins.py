"""Port of src/engine/coins.ts (the earn table, a task's pay, answeredAny) and src/engine/too-fast.ts (the one too-fast rule)."""
from __future__ import annotations

from .js import js_max, js_min, js_round, truthy

COINS = {'diagnostic_complete': 50, 'day_complete': 40, 'seed_fixture': 120, 'freeze_price': 100, 'game_daily_cap': 50, 'game_max_per_result': 30}
FREEZE_ITEM = 'o1'
TASK_COINS = {'tick': 5, 'quiz': 10, 'quiz_long': 20, 'quiz_long_over': 5}


def coins_for(e: dict) -> float:
    t = e['type']
    if t == 'diagnostic_complete':
        return COINS['diagnostic_complete']
    if t == 'task_done':
        return js_max(0, js_round(e['coins']))
    if t == 'day_complete':
        return 0 if e['rest'] else COINS['day_complete']
    if t == 'game_result':
        return js_max(0, js_min(js_round(e['claimed']), COINS['game_max_per_result'], COINS['game_daily_cap'] - e['paidToday']))
    return None  # the TS switch falls through: undefined


def task_coins(t: dict) -> float:
    if t['verification'] == 'self_report' and not truthy(t.get('deep')):
        return TASK_COINS['tick']
    if t['verification'] == 'quiz':
        q = t.get('questions')
        return TASK_COINS['quiz_long'] if (0 if q is None else q) > TASK_COINS['quiz_long_over'] else TASK_COINS['quiz']
    return t['coins']


UNDEF = object()  # a key present with the value undefined (JSON cannot carry it; fixtures tag it {"$undef": true})


def answered_any(a: dict) -> bool:
    for v in a.values():
        if v is not UNDEF and v is not None and v != 'skipped' and v != '' and not (isinstance(v, list) and len(v) == 0):
            # `v !== ''` and `v !== 'skipped'` are strict: 0 and false are answers
            if isinstance(v, bool) or not isinstance(v, str) or v not in ('', 'skipped'):
                return True
    return False


# ---- too-fast.ts ----
LISTEN_MIN_MS = 5000


def was_read(x: dict, read_ms: float, strict: bool = False) -> bool:
    if x.get('dk') is True:
        return True
    heard = x.get('heard')
    if heard is not None:
        return heard >= LISTEN_MIN_MS
    need = x.get('need')
    if need is None:
        return x['ms'] >= read_ms
    return x['ms'] >= (need if strict or not truthy(x.get('ok')) else js_min(need, read_ms))


def too_fast(log, read_ms: float = 0, strict: bool = False) -> bool:
    return read_ms > 0 and len(log) > 0 and sum(1 for x in log if was_read(x, read_ms, strict)) * 2 < len(log)
