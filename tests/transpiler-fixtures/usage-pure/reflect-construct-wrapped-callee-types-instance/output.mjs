import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Reflect$construct from "@core-js/pure/actual/reflect/construct";
var _ref;
// a parenthesized `Reflect.construct` is the same static, so what it builds is an instance of the class
// it names and a method call on it is typed by that class - also on the ESTree parser, where the
// parentheses are a node
class C {
  rows() {
    return [1];
  }
}
export const result = _atMaybeArray(_ref = _Reflect$construct(C, []).rows()).call(_ref, 0);