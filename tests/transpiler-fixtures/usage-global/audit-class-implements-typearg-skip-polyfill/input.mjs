// `class X implements Foo<Map<string, number>>` - Map in an implements clause is pure
// type-only (heritage erases at runtime), so no Map polyfill suite must emit. babel
// reports Map as a referenced Identifier and needs a pure-erase ancestor check to skip
// it; oxc's dedicated TSClassImplements wrapper already gates this. distinct from
// `extends Foo<Map<...>>` (superClass IS runtime) and from `type`/`interface` uses.
interface Foo<T> { x: T }
// @ts-expect-error an implements clause the class does not satisfy is the shape under test
class X implements Foo<Map<string, number>> {
  m() { return 1; }
}
