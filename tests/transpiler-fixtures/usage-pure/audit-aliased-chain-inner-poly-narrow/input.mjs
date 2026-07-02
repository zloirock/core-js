// alias-chain narrowing must combine with inner-chain detection. `const from = Array.from`
// narrows `arr` to Array, so the outer optional chain `arr?.at?.(0)?.findLast(x => x)`
// sees both `at` and `findLast` as polyfillable Array instance methods and emits them in a
// single combined call. lock the alias-chain narrow AND the inner-poly chain together
const from = Array.from;
const arr = from('xy');
const out = arr?.at?.(0)?.findLast(x => x);
export { out };
