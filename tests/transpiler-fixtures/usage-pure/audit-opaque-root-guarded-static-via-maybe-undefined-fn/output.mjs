import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// NEGATIVE: a MAYBE-undefined callee (conditional assignment) is not provable - the chain
// keeps the raw guarded read off the ref
let mf;
if (_globalThis.setTimeout) mf = () => _globalThis;
export const viaMaybeUndefinedFn = null == mf?.()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(17)).call(_ref, 0);