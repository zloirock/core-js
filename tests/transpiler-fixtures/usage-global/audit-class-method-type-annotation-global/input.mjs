// TS type annotations inside class method signatures (`m(x: Map): Set {}`) on babel are
// represented as class method nodes - distinct from a function expression. visitor entry was
// missing, so annotation globals (Map, Set) were not reported. parity with unplugin's ESTree
// class method wrapping a function expression (which the function visitor already covers)
class Foo {
  m(x: Map<string, number>): Set<string> { return new Set(); }
}
