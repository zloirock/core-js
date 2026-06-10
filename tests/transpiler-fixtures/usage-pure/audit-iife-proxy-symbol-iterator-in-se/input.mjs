// IIFE-rooted proxy chain on the LHS of a Symbol.iterator `in` test. the membership folds to
// is-iterable, dropping the symbol LHS - its IIFE chain root SE must be harvested and re-prepended
let calls = 0;
const arr = [1];
const has = (() => {
  calls++;
  return globalThis;
})().Symbol.iterator in arr;
