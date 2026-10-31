import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a COMPUTED trailing key with an SE evaluates after the collapsed static, in source order
let keyCount = 0;
const keySe = () => keyCount++;
const m = () => _globalThis;
export const viaComputedTrailing = null == m()?.window ? void 0 : (_ref = _Array$from([3]), keySe(), _atMaybeArray(_ref).call(_ref, 0));