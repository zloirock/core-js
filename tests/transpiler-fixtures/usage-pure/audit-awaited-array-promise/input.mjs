// Awaited<Array<Promise<X>>> in TS resolves to the Array (NOT Promise.all-like
// distribution). plugin's unwrapPromise stops at non-Promise outer. probe that
// Awaited keeps Array narrowing on Array<Promise<...>> without unwrapping the
// inner Promise (which would be incorrect TS semantics).
type R = Awaited<Array<Promise<number>>>;
declare const arr: R;
const last = arr.at(-1);
const ix = arr.findIndex(p => true);
export { last, ix };
