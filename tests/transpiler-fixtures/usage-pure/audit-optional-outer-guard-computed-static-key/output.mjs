import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
var _ref, _ref2, _ref3;
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
export const aliasComputed = null == (w = g) ? void 0 : _atMaybeArray(_ref = (c++, _Array$from)([1])).call(_ref, 0);
export const proxyNavComputed = null == (v = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2 = (d++, _Array$of)(5)).call(_ref2, 1);
export const seqCtorStaticComputed = null == (e++, u = _globalThis.window) ? void 0 : _toFixedMaybeNumber(_ref3 = (f++, _Number$MAX_SAFE_INTEGER)).call(_ref3, 2);