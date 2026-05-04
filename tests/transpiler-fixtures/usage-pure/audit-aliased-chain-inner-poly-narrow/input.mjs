// alias-chain narrowing must combine with inner-chain detection.
// `const from = Array.from` post-rewrite reads `_Array$from` binding's entry path
// `array/from`, decomposes to (Array, from), narrows arr's type to Array. Outer chain
// `arr?.at?.(0)?.findLast(x => x)` then dispatches: inner `at` and outer `findLast`
// both polyfillable instance methods on Array, must combine into single call. lock both
// the alias-chain narrow AND inner-poly chain emission together
const from = Array.from;
const arr = from('xy');
const out = arr?.at?.(0)?.findLast(x => x);
export { out };
