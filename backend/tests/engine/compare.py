"""Golden replay: read golden/engine/<module>/<fn>.jsonl, run the port, compare.

Comparison rules (one place, every module):
  - strings, booleans, null: exact (a bool is never equal to a number, unlike Python's True == 1);
  - integers: exact; a float that is an integer value equals the JSON integer (JS has one number type: 3 and 3.0 are one value);
  - floats: bit-exact counts as `exact`; otherwise |a - b| <= ABS_TOL or <= REL_TOL * max(|a|, |b|) counts as `tol` (the last bits of
    exp/log/pow differ between V8's fdlibm and the C library CPython calls); anything further is a failure;
  - {"$num": "NaN" | "Infinity" | "-Infinity" | "-0"}: that exact value, the sign of zero included;
  - {"$throws": message}: the port must raise (the message is not compared);
  - objects: the same key set (JSON.stringify drops undefined, so a missing key and a key set to undefined are one thing); arrays: the same length.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
GOLDEN = REPO / 'golden' / 'engine'
REL_TOL = 1e-10
ABS_TOL = 1e-12


class Throws:
    def __init__(self, err: BaseException):
        self.err = err


def untag(v):
    if isinstance(v, list):
        return [untag(x) for x in v]
    if isinstance(v, dict):
        if len(v) == 1 and '$num' in v:
            return {'NaN': math.nan, 'Infinity': math.inf, '-Infinity': -math.inf, '-0': -0.0}[v['$num']]
        return {k: untag(x) for k, x in v.items()}
    return v


def load(module: str, fn: str):
    with open(GOLDEN / module / f'{fn}.jsonl', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def fns_of(module: str) -> list[str]:
    return sorted(p.stem for p in (GOLDEN / module).glob('*.jsonl'))


@dataclass
class Tally:
    exact: int = 0
    tol: int = 0
    fail: int = 0
    skipped: int = 0
    max_rel: float = 0.0
    failures: list = field(default_factory=list)


class _Cmp:
    def __init__(self):
        self.tol_used = False
        self.max_rel = 0.0
        self.where = ''

    def num(self, a, b, path) -> bool:
        if isinstance(a, bool) or isinstance(b, bool):
            self.where = f'{path}: bool vs number'
            return False
        fa, fb = float(a), float(b)
        if math.isnan(fb):
            if math.isnan(fa):
                return True
            self.where = f'{path}: {a!r} != NaN'
            return False
        if fa == fb:
            if fa == 0 and math.copysign(1, fa) != math.copysign(1, fb):
                self.where = f'{path}: sign of zero {a!r} vs {b!r}'
                return False
            return True
        if math.isinf(fa) or math.isinf(fb) or math.isnan(fa):
            self.where = f'{path}: {a!r} != {b!r}'
            return False
        d = abs(fa - fb)
        rel = d / max(abs(fa), abs(fb))
        if d <= ABS_TOL or rel <= REL_TOL:
            self.tol_used = True
            self.max_rel = max(self.max_rel, rel)
            return True
        self.where = f'{path}: {a!r} != {b!r} (rel {rel:.3g})'
        return False

    def eq(self, actual, expected, path='$') -> bool:
        if isinstance(expected, dict) and set(expected) == {'$throws'}:
            if isinstance(actual, Throws):
                return True
            self.where = f'{path}: expected a throw ({expected["$throws"]}), got {actual!r:.120}'
            return False
        if isinstance(actual, Throws):
            self.where = f'{path}: raised {actual.err!r}'
            return False
        if expected is None or isinstance(expected, (str, bool)):
            if type(actual) is type(expected) and actual == expected or (expected is None and actual is None):
                return True
            self.where = f'{path}: {actual!r:.120} != {expected!r:.120}'
            return False
        if isinstance(expected, (int, float)):
            if not isinstance(actual, (int, float)):
                self.where = f'{path}: {actual!r:.120} is not a number ({expected!r})'
                return False
            return self.num(actual, expected, path)
        if isinstance(expected, list):
            if not isinstance(actual, (list, tuple)) or len(actual) != len(expected):
                self.where = f'{path}: list {actual!r:.200} != {expected!r:.200}'
                return False
            return all(self.eq(a, e, f'{path}[{i}]') for i, (a, e) in enumerate(zip(actual, expected)))
        if isinstance(expected, dict):
            if not isinstance(actual, dict):
                self.where = f'{path}: {actual!r:.120} is not an object'
                return False
            act = {k: v for k, v in actual.items() if v is not _DROP}
            if set(act) != set(expected):
                self.where = f'{path}: keys {sorted(act)} != {sorted(expected)}'
                return False
            return all(self.eq(act[k], expected[k], f'{path}.{k}') for k in expected)
        self.where = f'{path}: unhandled expected {expected!r}'
        return False


_DROP = object()  # a port may put this in a dict for "undefined": dropped before comparing, as JSON.stringify drops it


def replay(module: str, fn: str, run, skip=None) -> Tally:
    t = Tally()
    for case in load(module, fn):
        if skip and skip(case):
            t.skipped += 1
            continue
        try:
            got = run(untag(case['in']))
        except Exception as e:  # noqa: BLE001 - a raise is an outcome the fixture may expect
            got = Throws(e)
        c = _Cmp()
        if c.eq(got, untag(case['out'])):
            if c.tol_used:
                t.tol += 1
                t.max_rel = max(t.max_rel, c.max_rel)
            else:
                t.exact += 1
        else:
            t.fail += 1
            if len(t.failures) < 5:
                t.failures.append(f"{fn}#{case['id']}: {c.where}  in={json.dumps(case['in'], ensure_ascii=False)[:300]}")
    return t
