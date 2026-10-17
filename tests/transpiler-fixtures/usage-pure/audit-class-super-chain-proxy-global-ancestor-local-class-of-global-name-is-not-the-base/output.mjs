import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// An ancestor named through the global proxy resolves to a GLOBAL name, which no local declaration owns - so the hop must read it
// in the scope that ancestor is declared in and find nothing there.
class Base extends _globalThis.Array {}
// the local `Array` carries a poisoning static, but it is NOT this chain's base and must never be
// walked into - the narrow stays
export function localClassOfGlobalNameIsNotTheBase() {
  var _ref;
  class Array {
    static make() {
      this.items = "poison";
      return 1;
    }
  }
  class Sub extends Base {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _atMaybeArray(_ref = Sub.items).call(_ref, 0);
}