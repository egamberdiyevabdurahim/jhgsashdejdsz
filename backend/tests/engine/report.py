"""Parity table: `cd backend && .venv/Scripts/python -m tests.engine.report` (one line per module: exact / within tolerance / failed / skipped
as a recorded divergence / not ported yet)."""
from __future__ import annotations

import sys

from .adapters import ADAPTERS
from .compare import GOLDEN, REL_TOL, fns_of, replay
from .divergences import DIVERGENCES

KEYS = ('exact', 'tol', 'fail', 'skipped')


def _lines(m: str, fn: str) -> int:
    with open(GOLDEN / m / f'{fn}.jsonl', encoding='utf-8') as f:
        return sum(1 for _ in f)


def main() -> int:
    total = dict.fromkeys(KEYS, 0)
    total_pending = 0
    print(f'{"module":<14} {"fns":>4} {"exact":>7} {"tol":>6} {"fail":>5} {"skip":>5} {"pending":>8}  max rel err')
    for m in sorted(p.name for p in GOLDEN.iterdir() if p.is_dir()):
        row = dict.fromkeys(KEYS, 0)
        pending, mx = 0, 0.0
        for fn in fns_of(m):
            run = ADAPTERS.get(m, {}).get(fn)
            if run is None:
                pending += _lines(m, fn)
                continue
            div = DIVERGENCES.get((m, fn))
            t = replay(m, fn, run, skip=div[1] if div else None)
            for k in KEYS:
                row[k] += getattr(t, k)
            mx = max(mx, t.max_rel)
            for f in t.failures:
                print('   FAIL', f)
        for k in KEYS:
            total[k] += row[k]
        total_pending += pending
        print(f'{m:<14} {len(fns_of(m)):>4} {row["exact"]:>7} {row["tol"]:>6} {row["fail"]:>5} {row["skipped"]:>5} {pending:>8}  {mx:.2g}')
    print(f'{"TOTAL":<14} {"":>4} {total["exact"]:>7} {total["tol"]:>6} {total["fail"]:>5} {total["skipped"]:>5} {total_pending:>8}  (REL_TOL {REL_TOL:g})')
    return 1 if total['fail'] else 0


if __name__ == '__main__':
    sys.exit(main())
