import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4;
class A {
  static rows = "abc";
  get own() {
    return [5];
  }
}
class B extends A {
  static previous = _atMaybeString(_ref = this.rows).call(_ref, 0);
  static rows = [7];
}
const b = new B();
const first = _at(_ref2 = b.own).call(_ref2, 0);
Object.defineProperty(b, "own", {
  value: "xyz"
});
export const result = [B.previous, _atMaybeArray(_ref3 = B.rows).call(_ref3, 0), first, _at(_ref4 = b.own).call(_ref4, -1)];