import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// nested TS `as` and `satisfies` casts on a single expression: both wrappers are
// peeled so the polyfill rewrite recognises the underlying expression.
const x = _atMaybeArray(arr as string[]).call(arr as string[], 0) satisfies string;
const y = _includesMaybeArray(arr as string[]).call(arr as string[], 'test');