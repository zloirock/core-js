import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _String$raw from "@core-js/pure/actual/string/raw";
var _ref, _ref2;
// a prototype patch names its constructor through the value canon, so the realm reached by an
// ALIAS records the same pair the bare spelling does. the key decides what the pair says: a
// readable one names the slot and leaves everything else alone, an unreadable one hides which
// member was replaced, so the whole NAME deopts and its statics stop being substituted. the
// instance reads are the negative on both - the entry is pinned up front and keeps serving
// core-js's own implementation whatever the prototype holds
const xs = [];
const g = _globalThis;
g.String.prototype.at = patch;
_String$raw(xs);
_atMaybeString(_ref = 'ab').call(_ref, 0);
_globalThis.Number.prototype[key] = patch;
Number.isFinite(1);
_toFixedMaybeNumber(_ref2 = 1).call(_ref2, 2);