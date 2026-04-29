import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `[arr.at, arr.flat] = source;` and `[...arr.includes] = source;` -
// MemberExpression в ArrayPattern element / RestElement target slots is write-only context
// (assigns the destructure result, doesn't read the method). plugin must NOT emit `_at` /
// `_flat` / `_includes` polyfills - they would never run. read-context (`arr.at(0)`) at the
// end confirms the polyfill IS emitted when method is actually called
const arr = [];
const source = [];
[arr.at, arr.flat] = source;
[...arr.includes] = source;
export const v = _atMaybeArray(arr).call(arr, 0);