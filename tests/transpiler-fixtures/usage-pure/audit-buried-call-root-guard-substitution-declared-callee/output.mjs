import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
var _ref;
// BOUNDARY: the callee is declared above the chain, so its global sits outside the guard's span
const above = () => _globalThis;
export const declaredCallee = null == above()?.window ? void 0 : _flatMapMaybeArray(_ref = _Reflect$ownKeys({
  c: 3
})).call(_ref, key => [key]);