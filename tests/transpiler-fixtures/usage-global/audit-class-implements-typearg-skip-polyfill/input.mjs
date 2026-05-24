// `class X implements Foo<Map<string, number>>` - Map inside implements clause type-args
// is pure type-only context (implements heritage is erased at runtime, doesn't tell us X
// uses Map at runtime). babel's `isReferencedIdentifier` over-reports Map as referenced
// because TS-stripped output erases the whole TSExpressionWithTypeArguments - without a
// pure-erase ancestor check in `isTSTypeOnlyIdentifierPath`, handleIdentifier would emit
// full Map polyfill suite (es.map.constructor / es.map.species / et al). oxc emits the
// dedicated `TSClassImplements` wrapper which already gates correctly; babel needs the
// listKey walk to match. distinct from `extends Foo<Map<...>>` (superClass IS runtime)
// AND from `type T = Map<...>` / `interface I extends Set<...>` (user-signal runtime use)
interface Foo<T> { x: T }
class X implements Foo<Map<string, number>> {
  m() { return 1; }
}
