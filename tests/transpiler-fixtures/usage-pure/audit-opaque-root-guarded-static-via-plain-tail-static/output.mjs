import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a PLAIN (non-optional) ponyfillable tail hop collapses with the branch - only the optional
// window hop is a source of undefined
const pt = () => _globalThis;
export const viaPlainTailStatic = null == pt()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(22)).call(_ref, 0);