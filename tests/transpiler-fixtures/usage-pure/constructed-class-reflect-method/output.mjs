import _at from "@core-js/pure/actual/instance/at";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
var _ref;
// A returned object supplies its own method instead of the constructed prototype method.
class C {
  value() {
    return "ab";
  }
  constructor() {
    return {
      value() {
        return [4, 9];
      }
    };
  }
}
_at(_ref = _Reflect.construct(C, []).value()).call(_ref, -1);