import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// Scalar static defaults keep the user's fallback on a foreign receiver.
// Every claimed slot in a guarded pattern gets its own identity check.
let M = pickConstructor();
if (!M) M = Array;
const from = M === Array ? _Array$from : M.from,
  method = M === Array ? _Array$of : (_ref = M.of) === void 0 ? 1 : _ref;
export { from, method };