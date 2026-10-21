"""Port of src/engine/content/formula.ts: a math family's formula language (recursive descent to a tree, evaluated in floating point).

JS-vs-Python points taken here: `%` is JS's truncated remainder (math.fmod; Python's % floors), `a / 0` is +-Infinity or NaN, Math.floor
and Math.round of Infinity/NaN stay Infinity/NaN (Python's math.floor raises), Math.asin/acos/sqrt/log outside their domain give NaN
(Python raises), a JS function called with too few arguments sees undefined (NaN), the factorial multiplies in doubles (Python ints would be
exact past 2^53), truthiness of NaN is false. Math.sin/cos/tan/exp/log/hypot may differ from V8's in the last bit (golden tolerance).
"""
from __future__ import annotations

import math
import re

from ..js import JS_WS_CLASS, js_div, js_exp, js_log, js_max, js_min, js_pow, js_round, js_sqrt, truthy

NAN, INF = math.nan, math.inf


class FormulaError(Exception):
    pass


class FormulaSyntaxError(FormulaError):
    pass


def _isnum(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def js_floor(x: float) -> float:
    """Math.floor: Infinity/NaN/-0 pass through; the result is a double (Python's math.floor gives an int and loses -0)."""
    if math.isnan(x) or math.isinf(x) or x == 0:
        return x
    return float(math.floor(x))


def js_ceil(x: float) -> float:
    """Math.ceil: Math.ceil(-0.5) is -0."""
    if math.isnan(x) or math.isinf(x) or x == 0:
        return x
    if -1 < x < 0:
        return -0.0
    return float(math.ceil(x))


def js_mod(a: float, b: float) -> float:
    """JS `a % b`: the remainder takes the dividend's sign; NaN for b = 0 or an infinite a."""
    if math.isnan(a) or math.isnan(b) or math.isinf(a) or b == 0:
        return NAN
    if math.isinf(b):
        return a
    if isinstance(a, int) and isinstance(b, int):
        r = abs(a) % abs(b)
        return -r if a < 0 else r
    return math.fmod(a, b)


def js_sign(x: float) -> float:
    if math.isnan(x):
        return NAN
    if x > 0:
        return 1
    if x < 0:
        return -1
    return x


def _dom(f, lo, hi):
    def g(x):
        if math.isnan(x) or x < lo or x > hi:
            return NAN
        return f(x)
    return g


def _trig(f):
    def g(x):
        if math.isnan(x) or math.isinf(x):
            return NAN
        return f(x)
    return g


def _log10(x):
    v = js_log(x)
    return v if math.isnan(v) or math.isinf(v) else math.log10(x)


def _log2(x):
    v = js_log(x)
    return v if math.isnan(v) or math.isinf(v) else math.log2(x)


def _gcd(a, b):
    a, b = abs(js_round(a)), abs(js_round(b))
    while truthy(b):
        a, b = b, js_mod(a, b)
    return a


def _fact(n):
    if n < 0 or not (isinstance(n, int) or (isinstance(n, float) and n.is_integer())) or n > 170:
        return NAN
    r = 1.0
    for i in range(2, int(n) + 1):
        r *= i
    return r


def _round(x, d=0):
    m = js_pow(10, d)
    return js_div(js_round(x * m + js_sign(x) * 1e-9), m)


_SINF = _trig(math.sin)
_COSF = _trig(math.cos)
_TANF = _trig(math.tan)
_ASIN = _dom(math.asin, -1, 1)
_ACOS = _dom(math.acos, -1, 1)
D = math.pi / 180


def _cbrt(x):
    if math.isnan(x) or math.isinf(x):
        return x
    return math.cbrt(x)


def _atan(x):
    return NAN if math.isnan(x) else math.atan(x)


def _abs(x):
    return abs(x)


def _hypot(*xs):
    if any(math.isinf(x) for x in xs):
        return INF
    return math.hypot(*xs)


def _log(x, b=None):
    return _log10(x) if b is None else js_div(js_log(x), js_log(b))


# name -> (callable, arity the JS function reads; missing arguments are undefined = NaN, extra ones ignored)
FUNCTIONS = {
    'abs': (_abs, 1), 'sqrt': (js_sqrt, 1), 'cbrt': (_cbrt, 1), 'floor': (js_floor, 1), 'ceil': (js_ceil, 1), 'sign': (js_sign, 1),
    'exp': (js_exp, 1), 'ln': (js_log, 1), 'log10': (_log10, 1), 'log2': (_log2, 1), 'log': (_log, -2),
    'round': (_round, -2), 'min': (js_min, None), 'max': (js_max, None), 'hypot': (_hypot, None), 'gcd': (_gcd, 2),
    'lcm': (lambda a, b: js_div(abs(a * b), _gcd(a, b)), 2), 'fact': (_fact, 1),
    'comb': (lambda n, k: js_div(_fact(n), _fact(k) * _fact(n - k)), 2), 'perm': (lambda n, k: js_div(_fact(n), _fact(n - k)), 2),
    'sin': (_SINF, 1), 'cos': (_COSF, 1), 'tan': (_TANF, 1), 'asin': (_ASIN, 1), 'acos': (_ACOS, 1), 'atan': (_atan, 1),
    'sind': (lambda x: _SINF(x * D), 1), 'cosd': (lambda x: _COSF(x * D), 1), 'tand': (lambda x: _TANF(x * D), 1),
    'asind': (lambda x: _ASIN(x) / D, 1), 'acosd': (lambda x: _ACOS(x) / D, 1), 'atand': (lambda x: _atan(x) / D, 1),
}
CONSTANTS = {'pi': math.pi, 'e': math.e}


def _call(name: str, args: list):
    f, arity = FUNCTIONS[name]
    if arity is None:
        return f(*args)
    if arity < 0:  # one required parameter (undefined = NaN), then optional ones (undefined takes the default)
        args = list(args[:-arity])
        return f(*(args or [NAN]))
    args = list(args[:arity]) + [NAN] * max(0, arity - len(args))
    return f(*args)


_TOKEN = re.compile(f"[{JS_WS_CLASS}]*([0-9]+(?:\\.[0-9]+)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+|[A-Za-z_][A-Za-z0-9_]*|'[^']*'|\"[^\"]*\"|\\*\\*|//|==|!=|<=|>=|&&|\\|\\||[-+*/%^()<>!,\\[\\]])")
_BLANK = re.compile(f'[{JS_WS_CLASS}]*\\Z')


def tokens(src: str) -> list[str]:
    out: list[str] = []
    at = 0
    while at < len(src):
        if _BLANK.match(src, at):
            break
        m = _TOKEN.match(src, at)
        if not m:
            raise FormulaSyntaxError(f'cannot read "{src[at:at + 12]}" in "{src}"')
        out.append(m.group(1))
        at = m.end()
    return out


def parse(src: str):
    t = tokens(src)
    pos = [0]

    def peek():
        return t[pos[0]] if pos[0] < len(t) else None

    def take():
        v = peek()
        pos[0] += 1
        return v

    def want(s):
        if peek() != s:
            raise FormulaSyntaxError(f'expected "{s}" in "{src}"')
        pos[0] += 1

    def binary(nxt, ops):
        def f():
            a = nxt()
            while (peek() or '') in ops:
                op = take()
                a = ('bin', op, a, nxt())
            return a
        return f

    def atom():
        s = take()
        if s is None:
            raise FormulaSyntaxError(f'unexpected end of "{src}"')
        if s == '(':
            e = or_()
            want(')')
            return e
        if s == '[':
            items = []
            if peek() != ']':
                items.append(or_())
                while peek() == ',':
                    take()
                    items.append(or_())
            want(']')
            return ('arr', items)
        if s[0] in ("'", '"'):
            return ('str', s[1:-1])
        if re.match(r'[0-9.]', s):
            return ('num', float(s))
        if re.match(r'[A-Za-z_]', s):
            if peek() == '(':
                if s not in FUNCTIONS:
                    raise FormulaSyntaxError(f'unknown function {s}() in "{src}"')
                take()
                args = []
                if peek() != ')':
                    args.append(or_())
                    while peek() == ',':
                        take()
                        args.append(or_())
                want(')')
                return ('call', s, args)
            return ('var', s)
        raise FormulaSyntaxError(f'unexpected "{s}" in "{src}"')

    def postfix():
        a = atom()
        while peek() == '[':
            take()
            a = ('idx', a, or_())
            want(']')
        return a

    def power():
        a = postfix()
        if peek() in ('^', '**'):
            take()
            return ('bin', '^', a, unary())
        return a

    def unary():
        s = peek()
        if s in ('-', '+', '!'):
            take()
            return ('un', s, unary())
        return power()

    mul = binary(unary, ('*', '/', '//', '%'))
    add = binary(mul, ('+', '-'))
    CMP = ('==', '!=', '<', '<=', '>', '>=')

    def cmp():
        left = add()
        out = None
        while (peek() or '') in CMP:
            op = take()
            right = add()
            c = ('bin', op, left, right)
            out = ('bin', '&&', out, c) if out else c
            left = right
        return out if out else left

    and_ = binary(cmp, ('&&',))
    or_ = binary(and_, ('||',))
    e = or_()
    if pos[0] < len(t):
        raise FormulaSyntaxError(f'unexpected "{t[pos[0]]}" in "{src}"')
    return e


def _num(v, what: str):
    if not _isnum(v):
        raise FormulaError(f'{what} needs a number')
    return v


def _close(a, b) -> bool:
    return abs(a - b) <= 1e-9 * js_max(1, abs(a), abs(b))


def run(n, env):
    k = n[0]
    if k in ('num', 'str'):
        return n[1]
    if k == 'arr':
        return [run(x, env) for x in n[1]]
    if k == 'idx':
        a, i = run(n[1], env), _num(run(n[2], env), 'an index')
        if not isinstance(a, list):
            raise FormulaError('only a list can be indexed')
        if not (isinstance(i, int) or (isinstance(i, float) and i.is_integer())) or i < 0 or i >= len(a):
            raise FormulaError(f'index {i} outside the list')
        return a[int(i)]
    if k == 'var':
        name = n[1]
        if name in env:
            v = env[name]
            return float(v) if _isnum(v) else [float(x) if _isnum(x) else x for x in v]  # one number type: -0 must stay -0
        if name in CONSTANTS:
            return CONSTANTS[name]
        raise FormulaError(f'unknown name {name}')
    if k == 'un':
        a = _num(run(n[2], env), n[1])
        return -a if n[1] == '-' else (0 if truthy(a) else 1) if n[1] == '!' else a
    if k == 'call':
        return _call(n[1], [_num(run(x, env), f'{n[1]}()') for x in n[2]])
    op = n[1]
    av = run(n[2], env)
    if op == '&&':
        return 1 if truthy(_num(av, '&&')) and truthy(_num(run(n[3], env), '&&')) else 0
    if op == '||':
        return 1 if truthy(_num(av, '||')) or truthy(_num(run(n[3], env), '||')) else 0
    bv = run(n[3], env)
    if op in ('==', '!=') and (isinstance(av, str) or isinstance(bv, str)):
        same = isinstance(av, str) and isinstance(bv, str) and av == bv
        return 1 if same == (op == '==') else 0
    a, b = _num(av, op), _num(bv, op)
    if op == '+':
        return a + b
    if op == '-':
        return a - b
    if op == '*':
        return a * b
    if op == '/':
        return js_div(a, b)
    if op == '//':
        return js_floor(js_div(a, b))
    if op == '%':
        return js_mod(js_mod(a, b) + b, b)
    if op == '^':
        return js_pow(a, b)
    if op == '==':
        return 1 if _close(a, b) else 0
    if op == '!=':
        return 0 if _close(a, b) else 1
    if op == '<':
        return 1 if a < b else 0
    if op == '<=':
        return 1 if a <= b else 0
    if op == '>':
        return 1 if a > b else 0
    if op == '>=':
        return 1 if a >= b else 0
    raise FormulaError('bad node')


_CACHE: dict = {}


def _tree(src: str):
    t = _CACHE.get(src)
    if t is None:
        t = parse(src)
        _CACHE[src] = t
    return t


def evaluate(src: str, env=None):
    return _num(run(_tree(src), env or {}), f'"{src}"')


def evaluate_any(src: str, env=None):
    v = run(_tree(src), env or {})
    if isinstance(v, list):
        raise FormulaError(f'"{src}" is a list, not one value')
    return v


def names_in(src: str) -> list[str]:
    out: dict[str, None] = {}

    def walk(n):
        k = n[0]
        if k == 'var' and n[1] not in CONSTANTS:
            out.setdefault(n[1], None)
        elif k == 'un':
            walk(n[2])
        elif k == 'bin':
            walk(n[2])
            walk(n[3])
        elif k == 'idx':
            walk(n[1])
            walk(n[2])
        elif k == 'call':
            for x in n[2]:
                walk(x)
        elif k == 'arr':
            for x in n[1]:
                walk(x)

    walk(parse(src))
    return list(out)
