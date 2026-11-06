import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type WithRest<T> = [string, ...T[][]];
function run(t: WithRest<number>) {
  var _ref;
  _atMaybeArray(_ref = t[5]).call(_ref, 0);
}