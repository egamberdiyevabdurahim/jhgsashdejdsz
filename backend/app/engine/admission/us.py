"""Port of src/engine/admission/us.ts: the US holistic shape (frozen with model v4.3).

logit P(u) = c[A] + bE[E] + s_u + extra; s_u solved by bisection so the pool average equals the university's international rate; the 80 %
band is mean-centred (eta with E[sig(eta + tau Z)] = p, then sig(eta -+ half)).
"""
from __future__ import annotations

from ..js import js_log, js_round, js_sqrt
from .math import Z90, bisect, mean_sig, sig

C_A = (0.588, -2.968, -4.640, -9.534)
B_E = (4.232, 1.990, 0, -1.301)
N_A = (612, 59731, 57874, 18176)
_N = 0
for _n in N_A:
    _N += _n
PI_A = tuple(n / _N for n in N_A)
PI_E = (0.006, 0.234, 0.6, 0.16)


def pool_rate(s: float, pA=PI_A, pE=PI_E) -> float:
    r = 0.0
    for a in range(4):
        for e in range(4):
            r += pA[a] * pE[e] * sig(C_A[a] + B_E[e] + s)
    return r


_SHIFTS: dict[float, float] = {}


def solve_shift(r: float) -> float:
    k = js_round(r * 1e6) / 1e6
    s = _SHIFTS.get(k)
    if s is None:
        s = bisect(lambda x: pool_rate(x), -10, 10, k)
        _SHIFTS[k] = s
    return s


def cell_p(a: int, e: int, s: float, extra: float = 0) -> float:
    return sig(C_A[a] + B_E[e] + s + extra)


def soft_p(pA, pE, s: float, extra: float = 0) -> float:
    p = 0.0
    for a in range(4):
        for e in range(4):
            if pA[a] > 0 and pE[e] > 0:
                p += pA[a] * pE[e] * cell_p(a, e, s, extra)
    return p


def half_width(b: dict) -> float:
    """Object.values order = the object's own key order (insertion order); a dict keeps it the same way."""
    n = 0
    for x in b.values():
        x = 0 if x is None else x
        n = n + x * x  # (x ?? 0) ** 2: V8's pow returns x * x for an exponent of 2
    return js_sqrt(n)


def band(p: float, half: float) -> dict:
    if half <= 0:
        return {'eta': js_log(p / (1 - p)), 'lo': p, 'hi': p}
    tau = half / Z90
    eta = bisect(lambda x: mean_sig(x, tau), -30, 30, p, 64)
    return {'eta': eta, 'lo': sig(eta - half), 'hi': sig(eta + half)}
