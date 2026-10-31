import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// STRONG negatives: a guard does sit over a root inside each claim's span, yet every claim below is
// still owed - the nav feeding it was never consumed into a memo. dropping any of these would lose
// a polyfill silently, which is the only way the ownership gate can go wrong
export const staticClaimUnderGuard = null == _globalThis.window ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);