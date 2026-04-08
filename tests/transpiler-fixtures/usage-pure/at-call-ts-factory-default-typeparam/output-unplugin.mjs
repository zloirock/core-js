import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Box<T> = { v: T[] };
function makeBox<T = string>(): Box<T> {
  return { v: [] };
}
function run() {
var _ref;
  _atMaybeArray(_ref = makeBox().v).call(_ref, 0);
}