import _Array$from from "@core-js/pure/actual/array/from";
// usage-pure folds the same const-identifier-init destructure alias: `const arr = [Array]` then
// `const [A] = arr` makes A the global Array, so the static call substitutes the pure polyfill
const arr = [Array];
const [A] = arr;
export const r = _Array$from([1, 2]);