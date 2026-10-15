import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// A static read after an instance extraction is inserted after the traversal.
// Its live default must receive its own polyfill before that delayed insertion.
let M = pickConstructor();
if (!M) M = Array;
const first = _nameMaybeFunction(M);
const method = M === Array ? _Array$of : (_ref = M.of) === void 0 ? _atMaybeArray(_ref2 = [9]).call(_ref2, 0) : _ref;
export { first, method };