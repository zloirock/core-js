// Same class node: `implements Foo<Map<...>>` (type-only, no polyfill) + body method
// `make()` returns `new Map()` (runtime, emit). the body's `new Map()` must read as a
// runtime use even though a type-only `Map` sits in the implements clause of the SAME
// class - ClassBody is a pure-type-erase stop, so the upward scan halts there and emits
// the polyfill rather than wrongly reaching the implements clause and skipping it.
interface Foo<T> { x: T }
// @ts-expect-error an implements clause the class does not satisfy is the shape under test
class X implements Foo<Map<string, number>> {
  make() { return new Map(); }
}
