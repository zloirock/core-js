import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// SequenceExpression as arg to a KNOWN_STATIC_TYPE_GUARDS call: `Array.isArray((0, x))`
// at runtime evaluates to `Array.isArray(x)`. unwrapRuntimeExpr only stripped paren /
// chain / TS wrappers; unwrapExpressionChain (now used) alternates with SE-tail peel so
// the narrow activates symmetric with bare-Identifier arg
declare const x: string | string[];
if (Array.isArray((0, x))) {
  _atMaybeArray(x).call(x, 0);
}