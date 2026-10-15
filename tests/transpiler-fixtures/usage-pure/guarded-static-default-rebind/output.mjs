import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A default may rebind the source variable before the next slot is read.
// Guarded reads retain the original receiver throughout the pattern.
let M = pickConstructor();
if (!M) M = Array;
const method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, 1) : _ref2),
  from = _ref === Array ? _Array$from : _ref.from;
export { method, from };