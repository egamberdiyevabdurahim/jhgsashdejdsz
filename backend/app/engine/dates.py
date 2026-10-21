"""Port of src/engine/dates.ts (+ util.ts hash/fnv1a): local dates without a clock.

A LocalDate is 'YYYY-MM-DD'; arithmetic runs on UTC midnights (Date.UTC normalisation: a day or month past its range rolls over), never on
the server's own zone. Zones come from the IANA database (zoneinfo; on Windows the `tzdata` package supplies it, as Intl's ICU does in V8).
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from .js import first_unit, imul, js_round, u32, utf16_units

DAY_MS = 86_400_000
_EPOCH_ORD = datetime(1970, 1, 1).toordinal()
_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def _days_from_civil(y: int, m: int, d: int) -> int:
    """Days since 1970-01-01 of a proleptic Gregorian date (Howard Hinnant's algorithm; any year)."""
    y -= m <= 2
    era = (y if y >= 0 else y - 399) // 400
    yoe = y - era * 400
    doy = (153 * (m + (-3 if m > 2 else 9)) + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468


def _civil_from_days(z: int) -> tuple[int, int, int]:
    z += 719468
    era = (z if z >= 0 else z - 146096) // 146097
    doe = z - era * 146097
    yoe = (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365
    y = yoe + era * 400
    doy = doe - (365 * yoe + yoe // 4 - yoe // 100)
    mp = (5 * doy + 2) // 153
    d = doy - (153 * mp + 2) // 5 + 1
    m = mp + (3 if mp < 10 else -9)
    return y + (m <= 2), m, d


def date_utc(y: int, m0: int, d: int = 1, h: int = 0, mi: int = 0, s: int = 0, ms: int = 0) -> int:
    """Date.UTC(y, m0, d, h, mi, s, ms) with JS's rollover (m0 is 0-based; a year 0-99 means 1900+y, as JS)."""
    if 0 <= y <= 99:
        y += 1900
    y += m0 // 12
    m0 %= 12
    days = _days_from_civil(y, m0 + 1, 1) + (d - 1)
    return days * DAY_MS + h * 3_600_000 + mi * 60_000 + s * 1000 + ms


def iso_of_ms(ms: int) -> str:
    """new Date(ms).toISOString() (years 0-9999)."""
    days, rem = divmod(ms, DAY_MS)
    y, m, d = _civil_from_days(days)
    h, rem = divmod(rem, 3_600_000)
    mi, rem = divmod(rem, 60_000)
    s, msr = divmod(rem, 1000)
    return f'{y:04d}-{m:02d}-{d:02d}T{h:02d}:{mi:02d}:{s:02d}.{msr:03d}Z'


def _parts(d: str) -> tuple[int, int, int]:
    y, m, dd = (int(x) for x in d.split('-'))
    return y, m, dd


def _from_utc(ms: int) -> str:
    return iso_of_ms(ms)[:10]


def utc_ms(d: str) -> int:
    y, m, dd = _parts(d)
    return date_utc(y, m - 1, dd)


def _instant_ms(instant) -> int:
    if isinstance(instant, str):
        return parse_js_date(instant)
    return int(instant)


def _wall(ms: int, tz: str) -> datetime:
    return (datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(milliseconds=ms)).astimezone(ZoneInfo(tz))


def local_date_of(instant, tz: str) -> str:
    """The student's calendar date at an instant, in an IANA zone."""
    w = _wall(_instant_ms(instant), tz)
    return f'{w.year:04d}-{w.month:02d}-{w.day:02d}'


def zone_offset_min(instant: int, tz: str) -> int:
    """The zone's offset from UTC in minutes at an instant (Tashkent: +300). Intl's parts drop the milliseconds, then Math.round."""
    w = _wall(int(instant), tz)
    wall_ms = date_utc(w.year, w.month - 1, w.day, w.hour, w.minute, w.second)
    return int(js_round((wall_ms - int(instant)) / 60000))


def zoned_instant(d: str, hour: int, tz: str) -> int:
    """The instant (ms) of a local wall-clock hour in a zone. Callers wanting the TS Date use iso_of_ms()."""
    guess = utc_ms(d) + hour * 3_600_000
    first = guess - zone_offset_min(guess, tz) * 60000
    return guess - zone_offset_min(first, tz) * 60000


def add_days(d: str, n: int) -> str:
    y, m, dd = _parts(d)
    return _from_utc(date_utc(y, m - 1, dd + n))


def add_months(d: str, n: int) -> str:
    """Date.setMonth semantics (a day past the month's end rolls over), as the design's addM()."""
    y, m, dd = _parts(d)
    return _from_utc(date_utc(y, m - 1 + n, dd))


def weekday_of(d: str) -> int:
    """0 = Sunday ... 6 = Saturday, as Date.getDay()."""
    return (utc_ms(d) // DAY_MS + 4) % 7


def monday_of(d: str) -> str:
    return add_days(d, -((weekday_of(d) + 6) % 7))


def days_between(a: str, b: str) -> int:
    return int(js_round((utc_ms(b) - utc_ms(a)) / DAY_MS))


def months_between(a: str, b: str) -> int:
    ya, ma, _ = _parts(a)
    yb, mb, _ = _parts(b)
    return (yb - ya) * 12 + (mb - ma)


def dates_from(a: str, b: str) -> list[str]:
    out: list[str] = []
    d = a
    while d <= b:  # string order: ASCII dates compare the same in UTF-16 (JS) and code points (Python)
        out.append(d)
        d = add_days(d, 1)
    return out


_ISO = re.compile(r'^([+-]\d{6}|\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})?)?\Z')


def parse_js_date(s: str) -> int | None:
    """Date.parse for the ISO forms the engine writes. A date-only form is UTC; a date-time without an offset is the HOST's local time in JS
    (a semantic the port refuses: it raises, so no caller silently depends on the server's zone). None = Invalid Date."""
    m = _ISO.match(s)
    if not m:
        return None
    y = int(m.group(1))
    mo = int(m.group(2) or 1)
    d = int(m.group(3) or 1)
    if not (1 <= mo <= 12 and 1 <= d <= 31):
        return None
    if m.group(4) is None:
        return _days_from_civil(y, mo, d) * DAY_MS
    if m.group(8) is None:
        raise ValueError(f'local-time date-time {s!r}: JS reads it in the host zone')
    h, mi, sec = int(m.group(4)), int(m.group(5)), int(m.group(6) or 0)
    frac = (m.group(7) or '0')[:3].ljust(3, '0')
    ms = _days_from_civil(y, mo, d) * DAY_MS + h * 3_600_000 + mi * 60_000 + sec * 1000 + int(frac)
    z = m.group(8)
    if z != 'Z':
        sign = 1 if z[0] == '+' else -1
        ms -= sign * (int(z[1:3]) * 60 + int(z[4:6])) * 60_000
    return ms


def fmt_month(s: str | None) -> str:
    """'Nov 2028' as the design's fmtM, independent of the server's zone."""
    if not s:
        return ''
    ms = parse_js_date(f'{s}T00:00:00Z' if len(s) == 10 else s)
    if ms is None:
        return 'Invalid Date'
    y, m, _ = _civil_from_days(ms // DAY_MS)
    return f'{_MONTHS[m - 1]} {y}'


def fmt_day(s: str | None) -> str:
    """'Nov 1, 2028' as the design's fmtD."""
    if not s:
        return 'date being confirmed'
    ms = parse_js_date(f'{s[:10]}T00:00:00Z')
    if ms is None:
        return 'Invalid Date'
    y, m, d = _civil_from_days(ms // DAY_MS)
    return f'{_MONTHS[m - 1]} {d}, {y}'


def hash_(s: str, n: int) -> int:
    """The design's hash: `for (const c of s)` walks code points, and charCodeAt(0) of an astral one is its HIGH surrogate."""
    h = 7
    for c in s:
        h = u32(h * 31 + first_unit(c))
    return h % n


def fnv1a(s: str) -> str:
    """FNV-1a over UTF-16 code units, 8 hex digits."""
    h = 0x811C9DC5
    for unit in utf16_units(s):
        h ^= unit
        h = imul(h, 0x01000193)
    return format(h, '08x')
