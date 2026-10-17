import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An inline call returning the proxy global reaches a static through an optional window hop.
// The guard preserves root evaluation and short-circuiting before the static call or field read.
// The guarded static resolves to its ponyfill before the outer instance dispatch.
const f = () => _globalThis;
export const viaGuardedStaticCall = null == f()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);