import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
interface Base<T> {
  val: T extends number ? never : T;
}
interface Child extends Base<string> {}
declare const c: Child;
_atMaybeString(_ref = c.val).call(_ref, -1);