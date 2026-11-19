import _at from "@core-js/pure/actual/instance/at";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
var _ref;
// A returned object supplies its own method instead of the constructed prototype method.
class B {
  constructor() {
    return {
      value() {
        return [4, 9];
      }
    };
  }
}
class C {
  value() {
    return "ab";
  }
}
_at(_ref = _Reflect.construct(B, [], C).value()).call(_ref, -1);