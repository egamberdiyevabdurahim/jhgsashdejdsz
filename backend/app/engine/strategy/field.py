"""Port of src/engine/strategy/field.ts: the student's field against the activity catalog (C8).

Deliberate divergence (recorded in backend/tests/engine/divergences.py): the TS `field in FIELD_CATEGORY` and `PLAYBOOK_FIELDS[id]` also
find Object.prototype's names ('toString', 'constructor', '__proto__', ...). The port looks up own keys only; the API validates m2_field
against the bank's options, so no real input reaches that path."""
from __future__ import annotations

FIELD_CATEGORY: dict[str, tuple[str, ...]] = {
    'computer_science': ('building_tech',), 'engineering': ('building_tech',), 'mathematics': ('building_tech', 'research'),
    'natural_sciences': ('research', 'building_tech'), 'medicine': ('research', 'community_service'),
    'business': ('entrepreneurship', 'work'), 'economics': ('entrepreneurship', 'research'), 'law': ('community_service',),
    'social_sciences': ('community_service', 'research'), 'education': ('community_service',),
    'humanities': ('arts',), 'arts': ('arts',), 'design': ('arts',), 'architecture': ('arts', 'building_tech'), 'music': ('arts',), 'film': ('arts',),
}
_BOUND = {'C8-codapp': 'building_tech', 'C8-makerb': 'building_tech', 'C8-artpfl': 'arts'}
PLAYBOOK_FIELDS: dict[str, list[str]] = {pid: [f for f in FIELD_CATEGORY if cat in FIELD_CATEGORY[f]] for pid, cat in _BOUND.items()}


def fields_of(playbook_id: str):
    return PLAYBOOK_FIELDS.get(playbook_id)


def known_field(field):
    return field if isinstance(field, str) and field in FIELD_CATEGORY else None


def fits_field(playbook_id: str, field) -> bool:
    f, k = fields_of(playbook_id), known_field(field)
    return not f or not k or k in f
