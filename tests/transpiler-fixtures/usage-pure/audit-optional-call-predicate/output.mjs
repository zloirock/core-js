import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// optional-call user-predicate `obj.isStr?.(input)`: parseTypeGuard's `peelNegation`
// already strips ChainExpression / OptionalCallExpression via unwrapRuntimeExpr, so
// the truthy-branch narrow works through the same code path as a plain `obj.isStr(input)`
declare const obj: {
  isStr?(x: unknown): x is string;
};
function take(input: unknown) {
  if (obj.isStr?.(input)) {
    return _atMaybeString(input).call(input, 0);
  }
}