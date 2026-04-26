import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// source map mapping for deeply nested call expressions: each rewrite site must keep
// its source span reachable from the source map.
const result = _atMaybeArray(_ref = _Array$from(new _Set([1, 2, 3]))).call(_ref, -1);