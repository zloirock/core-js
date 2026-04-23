// TS type annotations inside class method signatures (`m(x: Map): Set {}`) on babel exposed
// as ClassMethod nodes — distinct from FunctionExpression. visitor entry was missing, so
// annotation globals (Map, Set) were not reported. parity with unplugin's ESTree MethodDefinition
// wrapping a FunctionExpression (which the Function visitor already covers)
class Foo {
  m(x: Map<string, number>): Set<string> { return new Set(); }
}
