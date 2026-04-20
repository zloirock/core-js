import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type Config = {
  items: string[];
};
interface Base<T> {
  val: T["items"];
}
interface Child extends Base<Config> {}
declare const c: Child;
_atMaybeArray(_ref = c.val).call(_ref, -1);