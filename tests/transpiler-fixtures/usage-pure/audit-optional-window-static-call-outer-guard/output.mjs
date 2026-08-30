import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
var _ref, _ref2, _ref3;
// three window-optional forms where a receiver-independent static under a KEPT trailing-instance guard must
// read BARE, and a bare-window ctor.static must collapse without crashing:
//   - bareCtorStatic: `globalThis.window?.Number.MAX_SAFE_INTEGER.toFixed(1)` - the whole proxy-root.ctor.static
//     subsumes into one pure static (the bare root skipped), guard erased. before: a transform crash.
//   - aliasStaticCall: `(w = g)?.Array.from([1])...` (g = globalThis alias) - the `.from` static reads bare
//     `_Array$from([1])`, NOT `(w = g, _Array$from)` (which double-ran the assign under the `.at` guard).
//   - seqStaticCall: `(c++, v = globalThis.window)?.Array.of(5)...` - same, plus the seq guard root substitutes
//     its buried `globalThis` (`(c++, v = _globalThis.window)`) and the `.of` reads bare `_Array$of(5)` (SE once).
// an outer guard that memoizes+runs the root SE owns it; the static must not re-fold it. distinct method per line.
let w;
let v;
let c = 0;
const g = _globalThis;
export const bareCtorStatic = null == _globalThis.window ? void 0 : _toFixedMaybeNumber(_ref = _Number$MAX_SAFE_INTEGER).call(_ref, 1);
export const aliasStaticCall = null == (w = g) ? void 0 : _includesMaybeArray(_ref2 = _Array$from([1])).call(_ref2, 1);
export const seqStaticCall = null == (c++, v = _globalThis.window) ? void 0 : _atMaybeArray(_ref3 = _Array$of(5)).call(_ref3, 0);