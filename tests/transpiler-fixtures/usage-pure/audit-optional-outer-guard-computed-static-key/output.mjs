import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
var _ref, _ref2, _ref3;
// a computed static key `[(se, 'name')]` folding to a pure static, reached through a trailing instance
// dispatch that memoizes the root. whatever the root's own verdict, the static emits BARE into the body
// that owns it, and the computed-KEY effect rides ahead of it (`(c++, _Array$from)`). three root shapes,
// two verdicts:
//   - an ALIAS-assign root (`w = g`, a defined realm value) - erase, the assign folds with the key effect
//   - a PROXY-NAV-assign root (`v = globalThis.window`, an unbacked hop) - guard; without the fold the
//     static stayed a native read off the memo, a missed polyfill on the floor
//   - a SEQUENCE root over the same probe - guard, and its ctor-static leaf folds its key SE too
// distinct static + instance method per line
let w;
let v;
let u;
const g = _globalThis;
let c = 0;
let d = 0;
let e = 0;
let f = 0;
export const aliasComputed = _atMaybeArray(_ref = (w = g, c++, _Array$from)([1])).call(_ref, 0);
export const proxyNavComputed = null == (v = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2 = (d++, _Array$of)(5)).call(_ref2, 1);
export const seqCtorStaticComputed = null == (e++, u = _globalThis.window) ? void 0 : _toFixedMaybeNumber(_ref3 = (f++, _Number$MAX_SAFE_INTEGER)).call(_ref3, 2);