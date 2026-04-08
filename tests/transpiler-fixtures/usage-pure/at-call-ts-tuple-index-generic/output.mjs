import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Pair<T> = [T[], string];
function run(p: Pair<number>) {
  var _ref;
  _atMaybeArray(_ref = p[0]).call(_ref, 0);
}