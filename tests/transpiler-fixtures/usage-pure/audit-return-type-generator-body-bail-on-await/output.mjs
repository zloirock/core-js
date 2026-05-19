// generator function awaited: `await gen()` resolves to the Generator instance,
// NOT to the body's `return value` (which is the iterator-completion TReturn,
// surfaced through `iter.next()`'s `{done: true, value}` payload). without
// `resolveBodyReturnType` bailing on generators, `resolveAwaitedFromCallBody`
// would scrape the body's `return [1,2,3]` and tell downstream that `await gen()`
// is `Array<number>`, dispatching the array-specific `.at` polyfill on a
// Generator instance - which has no `.at` at runtime. with the bail, the body
// fold returns null, the awaited-from-body path drops out, and `.at()` resolves
// through the generic instance polyfill (the conservative fallback)
function* gen() {
  yield 1;
  return [1, 2, 3];
}
async function probe() {
  (await gen()).at(0);
}
probe();