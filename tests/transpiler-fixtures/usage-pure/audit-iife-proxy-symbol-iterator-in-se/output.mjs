import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// IIFE-rooted proxy chain on the LHS of a Symbol.iterator `in` test. the membership folds to
// is-iterable, dropping the symbol LHS - its IIFE chain root SE must be harvested and re-prepended
let calls = 0;
const arr = [1];
const has = ((() => {
  calls++;
  return _globalThis;
})(), _isIterable(arr));