import _at from "@core-js/pure/actual/array/at";
import _filter from "@core-js/pure/actual/instance/filter";
function f(arr: number[]) {
  var _ref;
  _at(_ref = _filter(arr).call(arr, x => x > 0)).call(_ref, 0);
}