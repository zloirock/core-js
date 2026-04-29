// paren-wrapped variant of the same conservative skip. Pins that, when the parser keeps
// parens as AST nodes, peeling the wrapper above `super.includes` does not accidentally
// route the call through `_includes.call(this, x)`
class C extends Array {
  foo(x) { return (super.includes)(x); }
}
