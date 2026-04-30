// TS-runtime `namespace Set { ... }` inside a static block. `getTSRuntimeBindings`
// scans for TSModuleDeclaration anchors; static block exposes a body array via
// `getDirectStatementBody` so the namespace name lands in the cached Set
let captured: unknown;
class Container {
  static {
    namespace Set {
      export const value = 1;
    }
    captured = Set.value;
  }
}
export { Container, captured };