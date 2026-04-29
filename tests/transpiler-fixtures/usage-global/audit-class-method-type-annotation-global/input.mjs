// TS type annotations on class-method signatures (`m(x: Map): Set`) must be scanned for
// global references, on a par with annotations on plain function expressions.
class Foo {
  m(x: Map<string, number>): Set<string> { return new Set(); }
}
