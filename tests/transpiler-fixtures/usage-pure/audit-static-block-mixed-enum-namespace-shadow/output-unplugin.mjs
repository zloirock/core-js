// enum + namespace declared in the same static block. both must shadow concurrently;
// `getTSRuntimeBindings` caches the StaticBlock's name set per-anchor, so a single
// scan picks up TSEnumDeclaration + TSModuleDeclaration in one pass without
// repeated walks
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