import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Type alias of `Parameters<typeof fn>` indexed by position: `FnParams[0]` resolves
// through the alias to the function's first parameter type (`string[]`), so `xs.at(0)`
// emits the array-instance polyfill.
function fn(xs: string[], n: number): void {}
type FnParams = Parameters<typeof fn>;
declare const xs: FnParams[0];
_atMaybeArray(xs).call(xs, 0);