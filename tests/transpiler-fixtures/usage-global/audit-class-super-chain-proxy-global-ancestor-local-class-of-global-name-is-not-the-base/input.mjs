// An ancestor named through the global proxy resolves to a GLOBAL name, which no local declaration owns - so the hop must read it
// in the scope that ancestor is declared in and find nothing there.
class Base extends globalThis.Array {}
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
