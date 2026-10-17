import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a CONST-bound computed hop key resolves like the dotted spelling - the nested test guards
// the window prefix and the branch reads the ponyfill leaf
const ck = () => _globalThis;
const hopKey = 'self';
export const viaComputedMidHop = null == ck()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(16)).call(_ref, 0);