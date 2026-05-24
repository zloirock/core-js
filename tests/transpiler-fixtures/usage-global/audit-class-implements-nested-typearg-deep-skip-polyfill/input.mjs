// Deep type-arg nesting inside implements heritage: `Outer<Map<Set<string>, Promise<U>>>`.
// the ancestor walk in isInImplementsHeritage must skip ALL inner Identifiers (Map, Set,
// Promise) - each has its own TSTypeReference parent + intermediate TSTypeParameterInstantiation
// wrappers, and the walk needs to traverse multiple hops past these intermediates to hit
// the implements gate. without the iterative parent walk, only direct-child cases would be
// caught and the deeper Set / Promise refs would still leak as false-positive polyfills
interface Outer<T, U> { x: T; y: U }
class C implements Outer<Map<Set<string>, number>, Promise<string>> {
  m() { return 1; }
}
