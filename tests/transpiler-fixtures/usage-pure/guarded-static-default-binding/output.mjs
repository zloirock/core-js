import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// Scalar static defaults keep the user's fallback on a foreign receiver.
// Every claimed slot in a guarded pattern gets its own identity check.
let M = pickConstructor();
if (!M) M = Array;
const from = (_ref = M, _ref === Array ? _Array$from : _ref.from),
  method = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? 1 : _ref2;
export { from, method };