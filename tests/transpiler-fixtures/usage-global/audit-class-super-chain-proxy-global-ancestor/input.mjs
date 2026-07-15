// an ancestor named through the global proxy resolves to a GLOBAL name, which no local declaration
// owns - so the hop must read it in the scope that ancestor is declared in and find nothing there.
// read against the subclass's scope instead, a local class of the global's name answers for the
// global base: its statics get collected and a `super`-held one wrongly drops a sound narrow.
// both rows keep their narrow, so neither string leg may appear; the shadow is the only difference
class Base extends globalThis.Array {}
class Twin extends globalThis.Array {}

// the local `Array` carries a poisoning static, but it is NOT this chain's base and must never be
// walked into - the narrow stays
export function localClassOfGlobalNameIsNotTheBase() {
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
  return Sub.items.at(0);
}

// the same chain with no local shadow at all: the control that pins the shadow as the only variable
export function globalNameAncestorWithoutShadow() {
  class Sub extends Twin {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return Sub.items.includes("x");
}
