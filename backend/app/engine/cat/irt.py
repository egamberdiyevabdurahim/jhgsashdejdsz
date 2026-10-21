"""Port of src/engine/cat/irt.ts: the checks' measurement model (3PL with a fixed lower asymptote, the partial-credit model, the testlet
prior model with a shared passage effect, EAP on a 181-point grid). Pure and deterministic; sums run in the TS source's order."""
from __future__ import annotations

from ..js import js_exp, js_log, js_max, js_pow, js_sqrt

GRID_MIN, GRID_MAX, GRID_N = -4.5, 4.5, 181
GRID = [GRID_MIN + (i * (GRID_MAX - GRID_MIN)) / (GRID_N - 1) for i in range(GRID_N)]
SLOPE = 1.25
PRIOR_SD = 1.25
TESTLET_SD = 0.5


def marginal_slope(a: float, sd_b: float) -> float:
    q = a * sd_b / 1.702
    return a / js_sqrt(1 + q * q)


def _logistic(z: float) -> float:
    return 1 / (1 + js_exp(-z))


def p3(theta: float, b: float, c: float, a: float = SLOPE) -> float:
    return c + (1 - c) * _logistic(a * (theta - b))


def info(theta: float, b: float, c: float, a: float = SLOPE) -> float:
    p = p3(theta, b, c, a)
    if p <= 0 or p >= 1:
        return 0
    q = (p - c) / (1 - c)
    return a * a * q * q * (1 - p) / p


def max_info(c: float, a: float = SLOPE) -> float:
    return (a * a / (8 * ((1 - c) * (1 - c)))) * (1 - 20 * c - 8 * c * c + js_pow(1 + 8 * c, 1.5))


def pcm_probs(theta: float, steps, a: float = SLOPE) -> list[float]:
    s = [0.0]
    for k in range(len(steps)):
        s.append(s[k] + a * (theta - steps[k]))
    m = js_max(*s)
    e = [js_exp(v - m) for v in s]
    z = 0.0
    for v in e:
        z += v
    return [v / z for v in e]


U_NODES = [-3 + i * 0.75 for i in range(9)]


def _u_w() -> list[float]:
    w = [js_exp(-z * z / 2) for z in U_NODES]
    s = 0.0
    for v in w:
        s += v
    return [v / s for v in w]


U_W = _u_w()


def testlet_probs(theta: float, b, c: float, a: float = SLOPE, sd: float = TESTLET_SD) -> list[float]:
    K = len(b)
    out = [0.0] * (K + 1)
    for u in range(len(U_NODES)):
        dist = [1.0]
        for bi in b:
            p = p3(theta + sd * U_NODES[u], bi, c, a)
            nxt = [0.0] * (len(dist) + 1)
            for k in range(len(dist)):
                nxt[k] += dist[k] * (1 - p)
                nxt[k + 1] += dist[k] * p
            dist = nxt
        for k in range(K + 1):
            out[k] += U_W[u] * dist[k]
    return out


def testlet_cat(theta: float, r: dict) -> list[float]:
    steps = r.get('steps')
    a = r.get('a')
    a = SLOPE if a is None else a
    if steps is not None and len(steps) == len(r['b']):  # [] is truthy in JS: the length test decides
        return pcm_probs(theta, steps, a)
    return testlet_probs(theta, r['b'], r['c'], a)


def log_lik(r: dict) -> list[float]:
    a = r.get('a')
    a = SLOPE if a is None else a
    if r['kind'] == 'item':
        out = []
        for t in GRID:
            p = p3(t, r['b'], r['c'], a)
            out.append(js_log(js_max(p, 1e-300) if r['x'] else js_max(1 - p, 1e-300)))
        return out
    res = []
    for t in GRID:
        cat = testlet_cat(t, r)
        x = r['x']
        v = cat[x] if isinstance(x, int) and 0 <= x < len(cat) else 0
        res.append(js_log(js_max(v, 1e-300)))
    return res


def log_prior(mu: float, sd: float = PRIOR_SD) -> list[float]:
    out = []
    for t in GRID:
        q = (t - mu) / sd
        out.append(-0.5 * (q * q))
    return out


def eap(lp) -> dict:
    m = js_max(*lp)
    e = [js_exp(v - m) for v in lp]
    z = 0.0
    for v in e:
        z += v
    w = [v / z for v in e]
    theta = 0.0
    for i, v in enumerate(w):
        theta += v * GRID[i]
    var = 0.0
    for i, v in enumerate(w):
        d = GRID[i] - theta
        var += v * (d * d)
    return {'theta': theta, 'se': js_sqrt(var), 'w': w}


def posterior(prior: dict, rs) -> dict:
    sd = prior.get('sd')
    lp = log_prior(prior['mu'], PRIOR_SD if sd is None else sd)
    for r in rs:
        l = log_lik(r)
        for i in range(GRID_N):
            lp[i] += l[i]
    return eap(lp)


def mass_between(w, lo: float, hi: float) -> float:
    n = 0.0
    for i, v in enumerate(w):
        if lo <= GRID[i] < hi:
            n += v
    return n


def quantile(w, q: float) -> float:
    acc = 0.0
    for i in range(GRID_N):
        acc += w[i]
        if acc >= q:
            return GRID[i]
    return GRID_MAX
