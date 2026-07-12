import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4;
// A `?.` whose subject is ENTIRELY proxy navigation - a chain-assign root with proxy hops
// (`(q = globalThis).self`), paren-wrapped, or SE-prefixed - is dead: the subject collapses to
// the always-defined pure root, the guard deopts, and the collapse owns the emit, preserving the
// assignment and prefix effects as a sequence. a kept guard would memoize the raw `.self` hop
// (undefined off-engine) and silently swallow the polyfill. an alias subject deopts the same way,
// keeping its identifier. a BARE chain-assign subject (hops only AFTER the `?.`) collapses too:
// both emitters deopt the guard outright - the assign value is the always-defined pure root, so
// a guard would be dead, and the tail's redundant hop is dropped off the collapsed subject.
// a non-proxy leaf and a non-global assign value keep their guards untouched
// (those subjects may legitimately be undefined).
let q1, q2, q3, q4, q5, q6;
let c = 0;
let other;
export const parenSubject = _findLastMaybeArray((q1 = _globalThis, _globalThis).Array.prototype);
export const bareHopSubject = _flatMaybeArray((q2 = _globalThis, _globalThis).Array.prototype);
export const seqPrefixSubject = _atMaybeArray((c++, q3 = _globalThis, _globalThis).Array.prototype);
export const bareAssignSubject = _includesMaybeArray((q4 = _globalThis, _globalThis).Array.prototype);
const g = _globalThis;
export const aliasSubject = _findLastIndexMaybeArray(g.Array.prototype);
export const nonProxyLeaf = null == (_ref = (q5 = _globalThis).foo) ? void 0 : _at(_ref2 = _ref.bar).call(_ref2, 1);
export const nonGlobalAssign = null == (_ref3 = (q6 = other).self) ? void 0 : _at(_ref3.Array.prototype).call([1], 0);
// a SE-bearing computed hop key deopts too, its effect harvested into the collapsed sequence;
// a LOGICAL subject keeps the guard (the right operand may be picked), collapsing per-operand
let q7, q8;
export const seKeyHopSubject = _findLastMaybeArray((q7 = _globalThis, c++, _globalThis).Array.prototype);
export const logicalSubject = null == (_ref4 = (q8 = _globalThis, _self) || other) ? void 0 : _flatMaybeArray(_ref4.Array.prototype);