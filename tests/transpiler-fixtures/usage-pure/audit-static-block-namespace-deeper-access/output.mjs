// namespace `Set` inside a class StaticBlock referenced via 3-level chain `Set.outer.value`.
// the local TS runtime binding should shadow the global Set even when the access is deeper
// than the typical 2-level shape
let captured: unknown;
class Container {
  static {
    namespace Set {
      export const outer = {
        value: 1
      };
    }
    captured = Set.outer.value;
  }
}
export { Container, captured };