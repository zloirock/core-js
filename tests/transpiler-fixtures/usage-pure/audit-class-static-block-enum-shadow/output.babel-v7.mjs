// `enum Map { ... }` declared inside a class StaticBlock. the local enum binding shadows
// the global Map for the body of the static block, so `new Map.Foo()` should not emit
// the Map polyfill
let captured: unknown;
class C {
  static {
    enum Map {
      Foo,
      Bar,
    }
    captured = new Map.Foo();
  }
}
export { C, captured };