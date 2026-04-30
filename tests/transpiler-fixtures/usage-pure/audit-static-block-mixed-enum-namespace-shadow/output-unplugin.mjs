// class StaticBlock declares both `enum Map` and `namespace Set` in the same body.
// each TS runtime binding must shadow its own global concurrently within the block
let m: unknown, s: unknown;
class Container {
  static {
    enum Map { Foo }
    namespace Set {
      export const value = 1;
    }
    m = new Map.Foo();
    s = Set.value;
  }
}
export { Container, m, s };