// async generator annotated with `AsyncIterable<T>` (async sibling of Iterable<T>).
// previously `GENERATOR_LIKE_NAMES` only carried Async{Generator,Iterator,
// IterableIterator,IteratorObject}, so the yield-type extraction failed for
// `AsyncIterable<T>` and the generator branch emitted `AsyncIterator<null>`. with
// AsyncIterable added to the set, the yield type is recovered, for-await-of binds
// `arr` to `number[]`, and `arr.at(0)` dispatches the array-specific polyfill
async function* gen(): AsyncIterable<number[]> {
  yield [1, 2, 3];
  yield [4, 5];
}
async function probe() {
  for await (const arr of gen()) {
    arr.at(0);
  }
}
probe();
