import _at from "@core-js/pure/actual/instance/at";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
var _ref;
// A class constructor can return an object outside its declared instance family.
// The field stays unknown; this is a presence control for its instance-method polyfill.
// Reads from that replacement must retain instance polyfills.
class C {
  constructor() {
    return {
      value: [1, 2, 3]
    };
  }
  value = "abc";
}
_at(_ref = _Reflect.construct(C, []).value).call(_ref, -1);