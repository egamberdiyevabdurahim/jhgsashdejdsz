"""JavaScript semantics the engine relies on, made explicit for the Python port.

Every helper here exists because Python's builtin behaves differently from the V8 operation the TypeScript engine uses. The golden fixtures
(golden/engine/**) are the judge: a port module must use these helpers wherever the TS source uses the JS operation.

  js_round        Math.round: half rounds toward +Infinity (2.5 -> 3, -2.5 -> -2, -0.4 -> -0); Python round() is banker's.
  imul / u32      Math.imul and `>>> 0`: 32-bit wrap-around; Python ints never overflow.
  js_exp/js_log   Math.exp/Math.log return Infinity/-Infinity/NaN; Python's math raises OverflowError/ValueError.
  js_div          `/` by zero gives +-Infinity or NaN; Python raises ZeroDivisionError.
  js_pow          `**`/Math.pow: 1 ** Infinity is NaN, x ** 2 is x * x (fdlibm's own special case); Python 1.0 ** inf is 1.0.
  JS_WS, js_trim  JS \\s and String.prototype.trim: a fixed set (incl. U+FEFF, excl. U+001C-U+001F and U+0085); Python \\s/strip() differ.
  utf16_len       String.prototype.length counts UTF-16 code units; Python len() counts code points.
  utf16_units     charCodeAt over a string (astral characters are two surrogate units).
  js_max/js_min   Math.max/min: NaN wins, +0 beats -0, no arguments give -Infinity/+Infinity.
  js_num_str      String(number) for the cases the engine formats (integers, shortest round-trip floats, exponents past 1e21).
"""
from __future__ import annotations

import math
import re

M32 = 0xFFFFFFFF
INF = math.inf
NAN = math.nan


def u32(x: int) -> int:
    """ToUint32 (`x >>> 0`) of an integer."""
    return x & M32


def i32(x: int) -> int:
    """ToInt32 (`x | 0`) of an integer."""
    x &= M32
    return x - 0x100000000 if x & 0x80000000 else x


def imul(a: int, b: int) -> int:
    """Math.imul, returned as the unsigned 32-bit pattern (callers apply `>>> 0` in the TS source anyway)."""
    return (a * b) & M32


def to_uint32(v: float | int) -> int:
    """ToUint32 of any JS number (truncates, NaN/Infinity -> 0)."""
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return 0
        v = int(v)  # truncation toward zero, as ToUint32
    return v & M32


def js_round(x: float) -> float:
    """Math.round."""
    if isinstance(x, int):
        return x
    if math.isnan(x) or math.isinf(x):
        return x
    f = math.floor(x)
    r = f + 1 if x - f >= 0.5 else f
    if r == 0 and (x < 0 or (x == 0 and math.copysign(1.0, x) < 0)):
        return -0.0
    return r


def js_exp(x: float) -> float:
    try:
        return math.exp(x)
    except OverflowError:
        return INF


def js_log(x: float) -> float:
    if isinstance(x, float) and math.isnan(x):
        return NAN
    if x < 0:
        return NAN
    if x == 0:
        return -INF
    if x == INF:
        return INF
    return math.log(x)


def js_sqrt(x: float) -> float:
    if isinstance(x, float) and math.isnan(x):
        return NAN
    if x < 0:
        return NAN
    return math.sqrt(x)


def js_div(a: float, b: float) -> float:
    if b == 0:
        if a == 0 or (isinstance(a, float) and math.isnan(a)):
            return NAN
        neg = (a < 0) != (math.copysign(1.0, b) < 0)
        return -INF if neg else INF
    return a / b


def js_pow(x: float, y: float) -> float:
    if isinstance(y, float) and math.isnan(y):
        return NAN
    if y == 0:
        return 1.0
    if isinstance(x, float) and math.isnan(x):
        return NAN
    if abs(x) == 1 and math.isinf(y):
        return NAN
    if y == 2:
        return x * x
    try:
        return math.pow(x, y)
    except OverflowError:
        return INF if x > 0 or float(y).is_integer() and int(y) % 2 == 0 else -INF
    except ValueError:
        return NAN


def js_max(*xs: float) -> float:
    if not xs:
        return -INF
    best = -INF
    for x in xs:
        if isinstance(x, float) and math.isnan(x):
            return NAN
        if x > best or (x == 0 and best == 0 and math.copysign(1.0, best) < 0):
            best = x
    return best


def js_min(*xs: float) -> float:
    if not xs:
        return INF
    best = INF
    for x in xs:
        if isinstance(x, float) and math.isnan(x):
            return NAN
        if x < best or (x == 0 and best == 0 and math.copysign(1.0, x) < 0):
            best = x
    return best


# ECMAScript WhiteSpace + LineTerminator: what \s matches and trim() strips (ES2023, Unicode Zs as of V8's ICU).
JS_WS = '\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff'
JS_WS_CLASS = '\\t\\n\\v\\f\\r \\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff'
_TRIM = re.compile(f'^[{JS_WS_CLASS}]+|[{JS_WS_CLASS}]+\\Z')


def js_trim(s: str) -> str:
    return _TRIM.sub('', s)


def utf16_units(s: str) -> list[int]:
    b = s.encode('utf-16-le', 'surrogatepass')
    return [b[i] | (b[i + 1] << 8) for i in range(0, len(b), 2)]


def utf16_len(s: str) -> int:
    return sum(2 if ord(c) > 0xFFFF else 1 for c in s)


def first_unit(c: str) -> int:
    """`c.charCodeAt(0)` of one code point (the high surrogate for an astral one)."""
    cp = ord(c)
    return cp if cp < 0x10000 else 0xD800 + ((cp - 0x10000) >> 10)


def truthy(v: object) -> bool:
    """JS truthiness (`!!v`) of a JSON value: '', 0, -0, NaN, null and undefined are false; [] and {} are true."""
    if v is None or v is False:
        return False
    if v is True:
        return True
    if isinstance(v, (int, float)):
        return not (v == 0 or (isinstance(v, float) and math.isnan(v)))
    if isinstance(v, str):
        return v != ''
    return True


def js_num_str(x: float) -> str:
    """String(x) for a JS number."""
    if isinstance(x, bool):
        return 'true' if x else 'false'
    if isinstance(x, int):
        return str(x)
    if math.isnan(x):
        return 'NaN'
    if math.isinf(x):
        return 'Infinity' if x > 0 else '-Infinity'
    if x == 0:
        return '0'
    if x.is_integer() and abs(x) < 1e21:
        return str(int(x))
    r = repr(x)
    if 'e' in r:
        mant, exp = r.split('e')
        e = int(exp)
        if -7 < e < 21:
            return format(x, 'f').rstrip('0').rstrip('.') if '.' in format(x, 'f') else format(x, 'f')
        return f"{mant}e{'+' if e > 0 else '-'}{abs(e)}"
    return r
