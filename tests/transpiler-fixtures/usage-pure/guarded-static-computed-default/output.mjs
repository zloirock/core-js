import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A known computed static key can also carry a live user default.
// The fallback remains visitable and receives its own instance polyfill.
let M = pickConstructor();
if (!M) M = Array;
const key = 'of';
const method = M === Array ? _Array$of : (_ref = M.of) === void 0 ? _atMaybeArray(_ref2 = [9]).call(_ref2, 0) : _ref;
export { method };