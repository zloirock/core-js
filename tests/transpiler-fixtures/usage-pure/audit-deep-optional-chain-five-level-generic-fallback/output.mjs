import _at from "@core-js/pure/actual/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2, _ref3;
// 5-deep chain on 3-deep array: levels 4 and 5 bottom out at `number` via element-tracking.
// only the outermost (M5) gets the generic-fallback retry - matches babel's AST-mutation
// re-visit reach which also only re-enters the outermost chain member. M4 stays raw in both
const arr = [[[1]], [[2]]];
null == (_ref = _atMaybeArray(arr).call(arr, 0)) ? void 0 : _at(_ref2 = _atMaybeArray(_ref3 = _atMaybeArray(_ref).call(_ref, 0)).call(_ref3, 0).at(0)).call(_ref2, 0);