var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare class Parent { items(): string[] }
class Child extends Parent {
  test() { return super.items(); }
}
declare const c: Child;
_atMaybeArray(_ref = c.test()).call(_ref, 0);