import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
interface Base<T> { items: T }
interface Child extends Base<string[]> {}
declare const c: Child;
_atMaybeArray(_ref = c.items).call(_ref, -1);