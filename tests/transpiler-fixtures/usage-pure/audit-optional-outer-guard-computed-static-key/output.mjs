import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a computed static key `[(se, 'name')]` folding to a pure static, reached THROUGH an outer instance
// guard (a trailing `.at` / `.includes` / `.toFixed` dispatch memoizes the root). the outer guard owns
// the root's nullability + receiver SE, so the static emits BARE into its body regardless of the root
// value's own definedness - the computed-KEY effect the guard does not own rides ahead of the pure
// static (`(c++, _Array$from)`). three root shapes each reach the collapse through a distinct path:
//   - an ALIAS-assign root (`w = g`, defined) - verdict 'erase'
//   - a PROXY-NAV-assign root (`v = globalThis.window`, an undefinable window hop) - verdict 'guard',
//     moot under the outer guard; without this the static stayed raw `_ref.Array[(d++, 'of')]` (native,
//     missed polyfill on ie11)
//   - a SEQUENCE root (`(e++, u = globalThis.window)`) whose ctor-static leaf folds its key SE too
// distinct static + instance method per line.
let w;
let v;
let u;
const g = _globalThis;
let c = 0;
let d = 0;
let e = 0;
let f = 0;
export const aliasComputed = null == (_ref = w = g) ? void 0 : _at(_ref2 = (c++, _Array$from)([1])).call(_ref2, 0);
export const proxyNavComputed = null == (_ref3 = v = _globalThis.window) ? void 0 : _includes(_ref4 = (d++, _Array$of)(5)).call(_ref4, 1);
export const seqCtorStaticComputed = null == (_ref5 = (e++, u = _globalThis.window)) ? void 0 : _toFixedMaybeNumber(_ref6 = (f++, _Number$MAX_SAFE_INTEGER)).call(_ref6, 2);