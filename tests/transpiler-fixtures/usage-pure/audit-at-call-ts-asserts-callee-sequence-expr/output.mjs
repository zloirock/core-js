import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// assertion-statement guard with sequence-expression callee: `(0, assertString)(x)` -
// a common minification / TS-emit shape that loses the `this`-context. the parser sees
// SequenceExpression as the callee, NOT a bare Identifier, so the binding-name lookup
// inside `resolvePredicateGuard` fails without `unwrapRuntimeExpr` peeling. parity with
// the typeof / binary guard parsers that peel runtime wrappers before name comparison
function assertString(x: unknown): asserts x is string {}
function probe(x: unknown) {
  (0, assertString)(x);
  return _atMaybeString(x).call(x, 0);
}