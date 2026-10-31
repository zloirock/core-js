import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `asserts x is string` predicate invoked through a SequenceExpression callee
// `(0, assertString)(x)` - a minification / TS-emit shape. the assertion narrowing
// must still apply so `.at(0)` picks the string-specific polyfill
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  // @ts-expect-error an assertion called through a non-identifier callee is the shape under test
  (0, assertString)(x);
  // @ts-expect-error a runtime guard narrows the receiver where tsc does not, and the read sees the runtime value
  return _atMaybeString(x).call(x, 0);
}