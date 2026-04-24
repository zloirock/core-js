import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `[...xs, ...ys]` as destructure init. array spread invokes `Symbol.iterator` on each
// iterable, which is arbitrary user code with observable side effects. the init span
// must be preserved through polyfill rewrite so those iterator lookups still run
if (cond) var at = _atMaybeArray([...xs, ...ys]);
at(0);