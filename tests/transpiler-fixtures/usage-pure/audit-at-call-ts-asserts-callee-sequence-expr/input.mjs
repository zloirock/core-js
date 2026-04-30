// `asserts x is string` predicate invoked through a SequenceExpression callee
// `(0, assertString)(x)` - a minification / TS-emit shape. the assertion narrowing
// must still apply so `.at(0)` picks the string-specific polyfill
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  (0, assertString)(x);
  return x.at(0);
}
