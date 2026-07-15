import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// an ancestor named through the global proxy resolves to a GLOBAL name, which no local declaration
// owns - so the hop must read it in the scope that ancestor is declared in and find nothing there.
// read against the subclass's scope instead, a local class of the global's name answers for the
// global base: its statics get collected and a `super`-held one wrongly drops a sound narrow.
// both rows keep their narrow, so neither string leg may appear; the shadow is the only difference
class Base extends _globalThis.Array {}
class Twin extends _globalThis.Array {}

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

// the same chain with no local shadow at all: the control that pins the shadow as the only variable
export function globalNameAncestorWithoutShadow() {
  var _ref2;
  class Sub extends Twin {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _includesMaybeArray(_ref2 = Sub.items).call(_ref2, "x");
}