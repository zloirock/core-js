import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
function f({
  a = _atMaybeArray(_ref = [1]).call(_ref, 0)
}) {
  return a;
}