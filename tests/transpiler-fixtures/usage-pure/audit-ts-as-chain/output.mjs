import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Chain of TSAsExpression / TSSatisfiesExpression around a typed binding.
// findExpressionAnnotation should peel both wrappers in sequence.
declare const x: unknown;
_atMaybeArray(_ref = (x as {
  items: string[];
} as {
  items: string[];
}).items).call(_ref, 0);