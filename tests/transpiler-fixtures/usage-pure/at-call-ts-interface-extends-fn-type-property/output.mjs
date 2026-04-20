import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
interface Base<T> {
  fn: () => T;
}
interface Child extends Base<string[]> {}
declare const c: Child;
_atMaybeArray(_ref = c.fn()).call(_ref, -1);