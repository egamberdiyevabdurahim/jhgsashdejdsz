"""Port of src/engine/admission/math.ts: the admission model's small numerics, pure and deterministic.

sig/logit, erfc (Numerical Recipes' erfcc), Phi and its quantile (Acklam + one Halley step), E[sig(eta + tau Z)] on a fixed trapezoid grid,
bisection, mulberry32 and Box-Muller. Transcendentals go through js.js_exp/js_log (Infinity/NaN instead of Python's exceptions); their last
bit can differ from V8's fdlibm, which the golden harness allows for (backend/tests/engine/compare.py, REL_TOL).
"""
from __future__ import annotations

import math as _m
from typing import Callable

from ..js import imul, js_div, js_exp, js_log, js_sqrt, to_uint32, u32

SQRT2 = _m.sqrt(2)          # Math.SQRT2 = 1.4142135623730951
PI = _m.pi


def sig(x: float) -> float:
    return 1 / (1 + js_exp(-x))


def logit(p: float) -> float:
    return js_log(js_div(p, 1 - p))


def erfc(x: float) -> float:
    z = abs(x)
    t = 1 / (1 + 0.5 * z)
    r = t * js_exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))))
    return r if x >= 0 else 2 - r


def Phi(z: float) -> float:
    return 0.5 * erfc(-z / SQRT2)


_A = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
_B = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
_C = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]


def PhiInv(p: float) -> float:
    if p <= 0:
        return -_m.inf
    if p >= 1:
        return _m.inf
    a, b, c, d = _A, _B, _C, _D
    lo = 0.02425
    if p < lo:
        q = js_sqrt(-2 * js_log(p))
        x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    elif p <= 1 - lo:
        q = p - 0.5
        r = q * q
        x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    else:
        q = js_sqrt(-2 * js_log(1 - p))
        x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    e = Phi(x) - p
    u = e * js_sqrt(2 * PI) * js_exp((x * x) / 2)
    return x - u / (1 + (x * u) / 2)


Z90 = 1.2815515655446004


def _grid() -> tuple[list[float], list[float]]:
    h = 1 / 25
    z: list[float] = []
    w: list[float] = []
    s = 0.0
    for i in range(-200, 201):
        x = i * h
        f = js_exp(-(x * x) / 2) * (0.5 if i in (-200, 200) else 1)
        z.append(x)
        w.append(f)
        s += f
    return z, [v / s for v in w]


GRID_Z, GRID_W = _grid()


def mean_sig(eta: float, tau: float) -> float:
    if tau <= 0:
        return sig(eta)
    m = 0.0
    for i in range(len(GRID_Z)):
        m += GRID_W[i] * sig(eta + tau * GRID_Z[i])
    return m


def bisect(f: Callable[[float], float], lo: float, hi: float, target: float, it: int = 200) -> float:
    for _ in range(it):
        mid = (lo + hi) / 2
        if f(mid) < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def rng(seed) -> Callable[[], float]:
    """mulberry32. Every step is taken on the unsigned 32-bit pattern: ToInt32/ToUint32 only reinterpret those bits, so XOR, OR, imul and
    the wrapped sum give the same pattern as V8's int32 arithmetic."""
    a = to_uint32(seed)

    def nxt() -> float:
        nonlocal a
        a = u32(a + 0x6D2B79F5)
        t = a
        t = imul(t ^ (t >> 15), t | 1)
        t = u32(t ^ u32(t + imul(t ^ (t >> 7), t | 61)))
        return u32(t ^ (t >> 14)) / 4294967296

    return nxt


def normals(u: Callable[[], float]) -> Callable[[], float]:
    spare: list[float] = []

    def nxt() -> float:
        if spare:
            return spare.pop()
        a = u()
        while a <= 1e-12:
            a = u()
        b = u()
        r = js_sqrt(-2 * js_log(a))
        th = 2 * PI * b
        spare.append(r * _m.sin(th))
        return r * _m.cos(th)

    return nxt


def seed_of(s: str) -> int:
    from ..js import utf16_units
    h = 0x811C9DC5
    for unit in utf16_units(s):
        h ^= unit
        h = imul(h, 0x01000193)
    return h
