import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// chained generic substitution through a mapped-passthrough: `Outer<U> = Copy<U[]>`
// with `Outer<string>` should resolve to `string[]`, so `.at()` and `.includes()`
// pick the Array-specific polyfills
type Copy<T> = { [K in keyof T]: T[K] };
type Outer<U> = Copy<U[]>;
declare const arr: Outer<string>;
const first = _atMaybeArray(arr).call(arr, 0);
const has = _includesMaybeArray(arr).call(arr, 'a');
export { first, has };