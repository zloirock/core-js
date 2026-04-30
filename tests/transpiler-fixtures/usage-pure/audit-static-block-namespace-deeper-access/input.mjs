// namespace shadow with deeper-than-2 member chain inside a static block. asserts
// path-anchored shadow detection works when `Set` is the root of a 3-level access
// (Set.outer.value) rather than a 2-level (Set.value) - the chain's bottom is still
// the same `Set` Identifier so `findTSRuntimeBindingInPath` walking up from it must
// still find the namespace shadow
let captured: unknown;
class Container {
  static {
    namespace Set {
      export const outer = { value: 1 };
    }
    captured = Set.outer.value;
  }
}
export { Container, captured };
