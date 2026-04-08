import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Box<T> = { get(): T[] };
function run(b: Box<number>) {
var _ref;
  _atMaybeArray(_ref = b.get()).call(_ref, 0);
}