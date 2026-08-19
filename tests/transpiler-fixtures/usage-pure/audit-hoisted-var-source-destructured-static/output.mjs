import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
function f(cond) {
  var _ref;
  if (cond) {
    var G = Array;
  }
  const from = G === Array ? _Array$from : G.from;
  return _at(_ref = from([1, 2, 3])).call(_ref, 0);
}