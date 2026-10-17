import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
class Twin extends _globalThis.Array {}
// the same chain with no local shadow at all: the control that pins the shadow as the only variable
export function globalNameAncestorWithoutShadow() {
  var _ref;
  class Sub extends Twin {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _includesMaybeArray(_ref = Sub.items).call(_ref, "x");
}