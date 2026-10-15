import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A split assignment yields the receiver captured before its binding writes.
// A live default may rebind the source without changing the assignment's result.
let M = pickConstructor();
if (!M) M = Array;
let first, method;
const result = (first = (_ref = M, _ref === Array ? _Array$from : _ref.from), method = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, fallback()) : _ref2, _ref);
export { first, method, result };