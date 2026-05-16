import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-aliased global called without `new` (constructor coercion path):
// `const A = Array; A(3)` -> `Array(3)` -> `[, , ,]`. `resolveCallExpressionType` calls
// `resolveGlobalName(callee)` to detect known-constructor calls; fix walks the alias to
// recognise `A(3)` as `Array(3)`, return type Array, downstream `.at(0)` Array-specific.
const A = Array;
const arr = A(3);
_atMaybeArray(arr).call(arr, 0);