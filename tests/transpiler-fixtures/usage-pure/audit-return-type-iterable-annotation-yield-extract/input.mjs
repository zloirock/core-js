// generator function annotated with `Iterable<T>` (a structurally-equivalent
// shape - `Iterable<T>.[Symbol.iterator]()` returns `Iterator<T>`). previously
// `GENERATOR_LIKE_NAMES` only carried Generator / Iterator / IterableIterator /
// IteratorObject, so the yield-type extraction failed for `Iterable<T>` and the
// generator branch emitted `Iterator<null>`. with Iterable / AsyncIterable added
// to the set, the yield type is recovered, for-of binds `arr` to `number[]`, and
// `arr.at(0)` dispatches the array-specific polyfill
function* gen(): Iterable<number[]> {
  yield [1, 2, 3];
  yield [4, 5];
}
for (const arr of gen()) {
  arr.at(0);
}
