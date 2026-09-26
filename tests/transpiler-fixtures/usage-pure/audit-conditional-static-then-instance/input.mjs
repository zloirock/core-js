// destructure `const { from } = Array` followed by a call must narrow the call's return
// to Array so the chained `.at(-1)` picks the array-specific instance polyfill. second
// destructure uses `.findLast` to confirm narrowing applies per-method, not just `.at`
const { from } = Array;
const arr = from('hello');
const last = arr.at(-1);
const { from: of2 } = Array;
const arr2 = of2([1, 2, 3]);
const odd = arr2.findLast(x => x % 2);
export { last, odd };
