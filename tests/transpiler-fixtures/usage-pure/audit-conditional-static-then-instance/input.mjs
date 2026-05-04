// destructure-from-Array `const { from } = Array` post-rewrite (or unrewritten on
// unplugin), then call `from('hi')` and chain `.at(-1)` on the result. Pass 19+
// staticPairFromDestructure / staticPairFromPolyfillEntry feeds resolver to narrow
// `arr` -> string|Array (Array.from return type). `.at(-1)` should dispatch the
// Array-narrowed instance entry. distinct second declaration uses `.findLast` to
// show alias-chain narrowing applies per-method, not just `.at`
const { from } = Array;
const arr = from('hello');
const last = arr.at(-1);
const { from: of2 } = Array;
const arr2 = of2([1, 2, 3]);
const odd = arr2.findLast(x => x % 2);
export { last, odd };
