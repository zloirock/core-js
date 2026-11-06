import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A chain-assignment root keeps its write in the guard test while the static still collapses.
let held;
const ca = () => _globalThis;
export const viaChainAssignRoot = null == (held = ca())?.window ? void 0 : _atMaybeArray(_ref = _Array$of(7)).call(_ref, 0);