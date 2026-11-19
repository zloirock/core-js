import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an SE argument of the collapsed static call evaluates inside the guarded branch, in place
let argCount = 0;
const argSe = () => argCount++;
const sa = () => _globalThis;
export const viaSeArgument = null == sa()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(argSe())).call(_ref, 0);