var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
interface Base<T> {
  fn: (x: T) => T;
}
interface Child extends Base<string> {}
declare const c: Child;
_atMaybeString(_ref = c.fn("a")).call(_ref, -1);