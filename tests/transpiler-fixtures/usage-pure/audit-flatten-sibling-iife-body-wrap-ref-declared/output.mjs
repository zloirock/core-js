import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
const from = _Array$from;
const at = _atMaybeArray((() => {
  var _ref;
  return _concatMaybeArray(_ref = [1]).call(_ref, [2]);
})());
export { from, at };