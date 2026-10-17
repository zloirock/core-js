import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A discarded assignment splits guarded static reads in property order.
// A live user default belongs to the raw read, which is evaluated once.
let M = pickConstructor();
if (!M) M = Array;
let first, method;
first = M === Array ? _Array$from : M.from, method = M === Array ? _Array$of : (_ref = M.of) === void 0 ? fallback() : _ref;
export { first, method };