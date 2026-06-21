// chained polyfills mint `_ref`, `_ref2`, ..., `_ref10` UIDs in one scope; `_ref10`
// contains `_ref` as a substring. whole-identifier matching against the original source
// slice must not hit `_ref` inside `_ref10` when counting the 10th. 3 distinct chained
// instance methods each emit a separate import, so any miscount is visible per-line.
const a = arr.flat().at(-1);
const b = arr.flat().at(-1).includes(1);
const c = arr.flat().at(-1).includes(2).toString();
