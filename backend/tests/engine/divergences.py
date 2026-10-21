"""Cases the port deliberately does NOT reproduce, each with its reason. Anything not listed here must match its fixture."""
from __future__ import annotations

# Object.prototype's own names: in JS, `k in obj` and `obj[k]` on a plain object literal find them through the prototype chain.
JS_PROTO_KEYS = {'constructor', '__proto__', 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
                 'propertyIsEnumerable', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'}

DIVERGENCES = {
    ('small_rules', 'fieldsOf'): ('prototype-chain lookup: PLAYBOOK_FIELDS["toString"] is a function in JS; the port reads own keys only',
                                  lambda c: c['in'].get('id') in JS_PROTO_KEYS),
    ('small_rules', 'knownField'): ('prototype-chain lookup: "toString" in FIELD_CATEGORY is true in JS; the port reads own keys only',
                                    lambda c: c['in'].get('field') in JS_PROTO_KEYS),
    ('small_rules', 'fitsField'): ('prototype-chain lookup (fieldsOf/knownField above; JS throws "f.includes is not a function")',
                                   lambda c: c['in'].get('id') in JS_PROTO_KEYS or c['in'].get('field') in JS_PROTO_KEYS),
}
