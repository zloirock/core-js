// class StaticBlock declares both `enum Map` and `namespace Set` in the same body.
// each TS runtime binding must shadow its own global concurrently within the block
let m: unknown, s: unknown;
class Container {
  static {
    enum Map {
      Foo
    }
    // @ts-expect-error a namespace below the top level is the shape under test
    namespace Set {
      export const value = 1;
    }
    // @ts-expect-error a construction of the user's shadowing binding, which tsc refuses, is the shape under test
    m = new Map.Foo();
    s = Set.value;
  }
}
export { Container, m, s };