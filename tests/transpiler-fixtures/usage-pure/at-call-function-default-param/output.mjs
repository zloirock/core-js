import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A receiver memo in a parameter default belongs to that default evaluation.
// The function body cannot declare a var visible from the parameter list.
function f(x = (() => {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})()) {
  return x;
}