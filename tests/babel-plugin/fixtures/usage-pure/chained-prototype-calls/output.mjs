import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
function f(arr: number[]) {
  var _ref;
  _atMaybeArray(_ref = _filterMaybeArray(arr).call(arr, x => x > 0)).call(_ref, 0);
}