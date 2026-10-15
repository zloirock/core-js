import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A discarded assignment splits guarded static reads in property order.
// A live user default belongs to the raw read, which is evaluated once.
let M = pickConstructor();
if (!M) M = Array;
let first, method;
first = (_ref = M, _ref === Array ? _Array$from : _ref.from), method = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? fallback() : _ref2;
export { first, method };