import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a NESTED provable wrapper (`f` returns `g()` which returns the global) proves through the
// same inline canon, layer by layer
const ng = () => _globalThis;
const nf = () => ng();
export const viaNestedCallRoot = null == nf()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(21)).call(_ref, 0);