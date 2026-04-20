import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
declare class Parent {
  data: string[];
}
class Child extends Parent {}
declare const c: Child;
_atMaybeArray(_ref = c.data).call(_ref, 0);