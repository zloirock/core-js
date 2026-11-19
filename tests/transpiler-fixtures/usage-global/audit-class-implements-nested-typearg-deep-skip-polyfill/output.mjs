// Deep type-arg nesting inside implements heritage: `Outer<Map<Set<string>, Promise<U>>>`.
// inner Identifiers (Map, Set, Promise) each sit under their own TSTypeReference plus
// intermediate TSTypeParameterInstantiation wrappers; the implements-context walk must
// traverse multiple hops past these intermediates to reach the implements gate, else the
// deeper Set / Promise refs leak as false-positive polyfills (direct-child only).
interface Outer<T, U> {
  x: T;
  y: U;
}
// @ts-expect-error an implements clause the class does not satisfy is the shape under test
class C implements Outer<Map<Set<string>, number>, Promise<string>> {
  m() {
    return 1;
  }
}