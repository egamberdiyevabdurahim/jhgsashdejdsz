"""One adapter per golden function: the fixture's `in` (as the generator in tools/golden/leaf.ts wrote it) -> the port's output."""
from __future__ import annotations

from app.engine import coins as C
from app.engine import dates as D
from app.engine import endings as EN
from app.engine.admission import math as M
from app.engine.admission import us as US
from app.engine.cat import irt as IRT
from app.engine.content import formula as FM
from app.engine.content import text as TX
from app.engine.content import typed as TY
from app.engine.learner import elo as ELO
from app.engine.strategy import field as F
from app.engine.lessons import hw_plan as HW
from app.engine.lessons import levels as LV
from app.engine.lessons import mock as MK


def _u(v, undef):
    return undef if isinstance(v, dict) and v == {'$undef': True} else v


def _take(gen, n):
    return [gen() for _ in range(n)]


def _bisect_fn(kind, a):
    if kind == 'cubic':
        return lambda x: x * x * x + a * x
    if kind == 'sig':
        return lambda x: M.sig(x + a)
    return lambda x: M.mean_sig(x, a)


def _elo_run(i):
    s, it, out = {'theta': 0, 'answers': 0}, {'b': 0, 'answers': 0}, []
    for ok in i['oks']:
        u = ELO.elo_update(s, it, ok, i['guess'])
        s = {'theta': u['theta'], 'answers': s['answers'] + 1}
        it = {'b': u['b'], 'answers': it['answers'] + 1}
        out.append([u['p'], u['theta'], u['b']])
    return out


def _chain(i):
    s, out = LV.NEW_SKILL, []
    for st in i['sittings']:
        res = LV.apply_sitting(s, st)
        out.append(res)
        s = res['state']
    return out


ADAPTERS = {
    'content': {
        'normalise': lambda i: TX.normalise(i['s']),
        'wordCount': lambda i: TX.word_count(i['s']),
        'grams': lambda i: sorted(TX.grams(i['s'], i['n'])),
        'uzApostrophes': lambda i: TX.uz_apostrophes(i['s']),
        'englishWithUzbekMark': lambda i: TX.english_with_uzbek_mark(i['s']),
        'strayUzQuoteMarks': lambda i: TX.stray_uz_quote_marks(i['s']),
        'uzStrayMarks': lambda i: TX.uz_stray_marks(i['s']),
        'mixedScriptWords': lambda i: TX.mixed_script_words(i['s']),
        'jaccard': lambda i: TX.jaccard(TX.grams(i['a']), TX.grams(i['b'])),
        'similarPairs': lambda i: TX.similar_pairs(i['texts'], i['threshold']),
        'evaluateAny': lambda i: FM.evaluate_any(i['src'], i['env']),
        'namesIn': lambda i: FM.names_in(i['src']),
    },
    'homework': {
        'planSet': lambda i: HW.plan_set(i['lessons'], i['have']),
        'firstTry': lambda i: HW.first_try(i['items']),
        'hwPass': lambda i: HW.hw_pass(i['s']),
        'hwCoins': lambda i: HW.hw_coins(i['s'], i['items']),
        'toCorrect': lambda i: HW.to_correct(i['items']),
        'hwStatus': lambda i: HW.hw_status(i['t'], i['forDay'], i['today']),
        'hwWords': lambda i: HW.hw_words(i['lang'], i['n']),
        'hwCard': lambda i: HW.hw_card(i['i']),
        'needsAttention': lambda i: HW.needs_attention(i['rows'], i['today'], i['weekAgo']),
        'applySittingChain': _chain,
        'skillLine': lambda i: LV.skill_line(i['r'], i['unit'], i['lang']),
        'levelDots': lambda i: LV.level_dots(i['l']),
        'nextHint': lambda i: LV.next_hint(i['l'], i['lang']),
        'courseLine': lambda i: LV.course_line(i['c'], i['lang']),
        'dtmSittingOf': lambda i: MK.dtm_sitting_of(i['tracks'], i['group']),
        'dtmScore': lambda i: MK.dtm_score(i['blocks'], i['rights']),
        'mockSaturdays': lambda i: MK.mock_saturdays(i['from'], i['due'], i['n']),
        'mockKindOf': lambda i: MK.mock_kind_of(i),
        'satMockResult': lambda i: MK.sat_mock_result(i['s'], i['last']),
    },
    'dates': {
        'utcMs': lambda i: D.utc_ms(i['d']),
        'weekdayOf': lambda i: D.weekday_of(i['d']),
        'mondayOf': lambda i: D.monday_of(i['d']),
        'fmtMonth': lambda i: D.fmt_month(i['s']),
        'fmtDay': lambda i: D.fmt_day(i['s']),
        'addDays': lambda i: D.add_days(i['d'], i['n']),
        'addMonths': lambda i: D.add_months(i['d'], i['n']),
        'daysBetween': lambda i: D.days_between(i['a'], i['b']),
        'monthsBetween': lambda i: D.months_between(i['a'], i['b']),
        'datesFrom': lambda i: D.dates_from(i['a'], i['b']),
        'localDateOf': lambda i: D.local_date_of(i['ms'], i['tz']),
        'zoneOffsetMin': lambda i: D.zone_offset_min(i['ms'], i['tz']),
        'zonedInstant': lambda i: D.iso_of_ms(D.zoned_instant(i['d'], i['hour'], i['tz'])),
        'hash': lambda i: D.hash_(i['s'], i['n']),
        'fnv1a': lambda i: D.fnv1a(i['s']),
    },
    'admission_math': {
        'sig': lambda i: M.sig(i['x']),
        'erfc': lambda i: M.erfc(i['x']),
        'Phi': lambda i: M.Phi(i['z']),
        'logit': lambda i: M.logit(i['p']),
        'PhiInv': lambda i: M.PhiInv(i['p']),
        'meanSig': lambda i: M.mean_sig(i['eta'], i['tau']),
        'bisect': lambda i: M.bisect(_bisect_fn(i['kind'], i['a']), i['lo'], i['hi'], i['target'], i['it']),
        'rng': lambda i: _take(M.rng(i['seed']), i['n']),
        'normals': lambda i: _take(M.normals(M.rng(i['seed'])), i['n']),
        'seedOf': lambda i: M.seed_of(i['s']),
    },
    'admission_us': {
        'constants': lambda i: {'C_A': US.C_A, 'B_E': US.B_E, 'N_A': US.N_A, 'PI_A': US.PI_A, 'PI_E': US.PI_E},
        'poolRate': lambda i: US.pool_rate(i['s']),
        'solveShift': lambda i: US.solve_shift(i['r']),
        'cellP': lambda i: US.cell_p(i['a'], i['e'], i['s'], i['extra']),
        'softP': lambda i: US.soft_p(i['pA'], i['pE'], i['s'], i['extra']),
        'halfWidth': lambda i: US.half_width(i['b']),
        'band': lambda i: US.band(i['p'], i['half']),
    },
    'cat_irt': {
        'grid': lambda i: IRT.GRID,
        'p3': lambda i: IRT.p3(i['theta'], i['b'], i['c'], i['a']),
        'info': lambda i: IRT.info(i['theta'], i['b'], i['c'], i['a']),
        'maxInfo': lambda i: IRT.max_info(i['c'], i['a']),
        'marginalSlope': lambda i: IRT.marginal_slope(i['a'], i['sdB']),
        'pcmProbs': lambda i: IRT.pcm_probs(i['theta'], i['steps'], i['a']),
        'testletProbs': lambda i: IRT.testlet_probs(i['theta'], i['b'], i['c'], i['a'], i['sd']),
        'testletCat': lambda i: IRT.testlet_cat(i['theta'], {'b': i['b'], 'c': i['c'], 'steps': i['steps']}),
        'logLik': lambda i: IRT.log_lik(i['r']),
        'logPrior': lambda i: IRT.log_prior(i['mu'], i['sd']),
        'posterior': lambda i: IRT.posterior(i['prior'], i['rs']),
        'posteriorThetaSe': lambda i: {k: v for k, v in IRT.posterior(i['prior'], i['rs']).items() if k != 'w'},
        'massBetweenOf': lambda i: IRT.mass_between(IRT.posterior(i['prior'], i['rs'])['w'], i['lo'], i['hi']),
        'quantileOf': lambda i: IRT.quantile(IRT.posterior(i['prior'], i['rs'])['w'], i['q']),
    },
    'learner_elo': {
        'kOf': lambda i: ELO.k_of(i['answers']),
        'kOfItem': lambda i: ELO.k_of(i['answers'], ELO.ELO_ITEM_K),
        'pCorrect': lambda i: ELO.p_correct(i['theta'], i['b'], i['guess']),
        'eloUpdate': lambda i: ELO.elo_update(i['skill'], i['item'], i['ok'], i['guess']),
        'masteryOf': lambda i: ELO.mastery_of(i['theta'], i['answers'], i['ref']),
        'credited': lambda i: ELO.credited(i['theta'], i['ref']),
        'skillAt': lambda i: ELO.skill_at(i['row'], i['theta'], i['o']),
        'eloRun': _elo_run,
    },
    'small_rules': {
        'coinsFor': lambda i: C.coins_for(i['e']),
        'taskCoins': lambda i: C.task_coins(i['t']),
        'answeredAny': lambda i: C.answered_any({k: _u(v, C.UNDEF) for k, v in i['a'].items()}),
        'wasRead': lambda i: C.was_read(i['x'], i['readMs'], i['strict']),
        'tooFast': lambda i: C.too_fast(i['log'], i['readMs'], i['strict']),
        'realText': lambda i: EN.real_text(i['v']),
        'realAnswer': lambda i: EN.real_answer(_u(i['v'], EN.UNDEF), i['q']),
        'countsAnswered': lambda i: EN.counts_answered(_u(i['v'], EN.UNDEF), i['q']),
        'optionalQ': lambda i: EN.optional_q(i['q']),
        'profilePay': lambda i: EN.profile_pay(i['coins'], i['answered'], i['asked']),
        'dayCount': lambda i: EN.day_count(i['tasks']),
        'normTyped': lambda i: TY.norm_typed(i['s']),
        'withinLimit': lambda i: TY.within_limit(i['s'], i['lim']),
        'typedRight': lambda i: TY.typed_right(i['answer'], i['accept'], i['lim']),
        'printedExtra': lambda i: TY.printed_extra(i['answer'], i['accept'], i['stem']),
        'PLAYBOOK_FIELDS': lambda i: F.PLAYBOOK_FIELDS,
        'fieldsOf': lambda i: F.fields_of(i['id']),
        'knownField': lambda i: F.known_field(i['field']),
        'fitsField': lambda i: F.fits_field(i['id'], i['field']),
    },
}
