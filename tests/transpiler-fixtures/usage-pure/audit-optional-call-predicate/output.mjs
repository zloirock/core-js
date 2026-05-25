import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// optional-call user-predicate `obj.isStr?.(input)`: negation peel already strips
// ChainExpression / OptionalCallExpression via the runtime-transparent peel, so the
// truthy-branch narrow works through the same code path as a plain `obj.isStr(input)`
declare const obj: {
  isStr?(x: unknown): x is string;
};
function take(input: unknown) {
  if (obj.isStr?.(input)) {
    return _atMaybeString(input).call(input, 0);
  }
}