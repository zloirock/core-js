import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// Quiet realm subjects retain their optional fold through stores, aliases and prefixes.
// Effectful realm keys keep native navigation; non-realm subjects retain their guards.
let q1, q2, q3, q4, q5, q6;
let c = 0;
let other;
export const parenSubject = _findLastMaybeArray((q1 = _globalThis, _self).Array.prototype);
export const bareHopSubject = _flatMaybeArray((q2 = _globalThis, _self).Array.prototype);
export const seqPrefixSubject = _atMaybeArray((c++, q3 = _globalThis, _self).Array.prototype);
export const bareAssignSubject = _includesMaybeArray((q4 = _globalThis, _self).Array.prototype);
const g = _globalThis;
export const aliasSubject = _findLastIndexMaybeArray(g.Array.prototype);
export const nonProxyLeaf = null == (_ref = (q5 = _globalThis).foo) ? void 0 : _at(_ref2 = _ref.bar).call(_ref2, 1);
export const nonGlobalAssign = null == (_ref3 = (q6 = other).self) ? void 0 : _at(_ref3.Array.prototype).call([1], 0);
let q7, q8;
export const seKeyHopSubject = _findLastMaybeArray((q7 = _globalThis)[c++, 'self'].Array.prototype);
export const logicalSubject = null == (q8 = _globalThis, _self) ? void 0 : _flatMaybeArray(_self.Array.prototype);