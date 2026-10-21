"""Engine golden parity: every (module, fn) with an adapter replays its fixtures and must match (backend/tests/engine/compare.py rules).

Run from backend/:  .venv/Scripts/python -m pytest tests/engine -q        (summary table: python -m tests.engine.report)
"""
from __future__ import annotations

import pytest

from .adapters import ADAPTERS
from .compare import GOLDEN, fns_of, replay
from .divergences import DIVERGENCES

CASES = [(m, fn) for m in sorted(ADAPTERS) if (GOLDEN / m).exists() for fn in fns_of(m)]


@pytest.mark.parametrize('module,fn', CASES, ids=[f'{m}.{f}' for m, f in CASES])
def test_parity(module: str, fn: str):
    run = ADAPTERS[module].get(fn)
    if run is None:
        pytest.skip(f'{module}.{fn}: not ported yet')
    div = DIVERGENCES.get((module, fn))
    t = replay(module, fn, run, skip=div[1] if div else None)
    assert t.fail == 0, '\n'.join([f'{t.fail} of {t.exact + t.tol + t.fail} cases differ'] + t.failures)
    assert t.exact + t.tol > 0
