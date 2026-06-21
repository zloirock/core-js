// `await gen()` resolves to the Generator instance, NOT the body's `return [1,2,3]`
// (that is the iterator-completion TReturn surfaced via `next()`'s `{done,value}`).
// body-return resolution must bail on generators, else `await gen()` types as
// `Array<number>` and dispatches the array `.at` polyfill on a Generator (no `.at`
// at runtime). bailing falls back to the generic instance polyfill.
function* gen() {
  yield 1;
  return [1, 2, 3];
}
async function probe() {
  (await gen()).at(0);
}
probe();