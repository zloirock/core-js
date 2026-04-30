// `namespace Set { ... }` declared inside a class StaticBlock. the namespace is a TS
// runtime binding that shadows the global Set within the static block, so `Set.value`
// must resolve to the local namespace member rather than emitting the Set polyfill
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