// usage-pure folds the same const-identifier-init destructure alias: `const arr = [Array]` then
// `const [A] = arr` makes A the global Array, so the static call substitutes the pure polyfill
const arr = [Array];
const [A] = arr;
export const r = A.from([1, 2]);
