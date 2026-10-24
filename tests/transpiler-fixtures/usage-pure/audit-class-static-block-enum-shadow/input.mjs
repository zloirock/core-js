// `enum Map { ... }` declared inside a class StaticBlock. the local enum binding shadows
// the global Map for the body of the static block, so `new Map.Foo()` should not emit
// the Map polyfill
let captured: unknown;
class C {
  static {
    enum Map { Foo, Bar }
    // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
    captured = new Map.Foo();
  }
}
export { C, captured };
