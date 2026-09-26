import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
function process(items) {
  return _mapMaybeArray(items).call(items, x => {
    var _ref;
    return _at(_ref = getArr(x)).call(_ref, -1);
  });
}