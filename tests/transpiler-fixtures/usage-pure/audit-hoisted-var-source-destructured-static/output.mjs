import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function f(cond) {
  var _ref;
  if (cond) {
    var G = Array;
  }
  const {
    from
  } = G;
  return _atMaybeArray(_ref = from([1, 2, 3])).call(_ref, 0);
}