import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
function process(items) {
var _ref;
  return _mapMaybeArray(items).call(items, x => _at(_ref = getArr(x)).call(_ref, -1));
}