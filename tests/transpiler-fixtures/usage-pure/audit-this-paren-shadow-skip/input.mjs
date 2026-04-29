// `(this).at(0)` in an instance method where the class declares its own `at`. The
// shadow check peels parens and TS wrappers so a paren preserved as an AST node (or
// `(this as any).at(0)`) still reaches the `this` detection. Peeling keeps the call
// routed through the user's own `at` method rather than rewriting it to
// `_atMaybeArray(this).call(this, 0)`
class C extends Array {
  at() { return 'shadowed'; }
  foo() { return (this).at(0); }
}
