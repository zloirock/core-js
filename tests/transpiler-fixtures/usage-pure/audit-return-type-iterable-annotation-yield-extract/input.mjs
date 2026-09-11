// generator annotated with `Iterable<T>` (structurally `[Symbol.iterator]()` yields
// `Iterator<T>`). the generator-like name set must include Iterable / AsyncIterable,
// else yield-type extraction fails and the branch emits `Iterator<null>`. with it
// recognized the yield type is recovered, for-of binds `arr` to `number[]`, and
// `arr.at(0)` hits the array-specific polyfill.
function* gen(): Iterable<number[]> {
  yield [1, 2, 3];
  yield [4, 5];
}
for (const arr of gen()) {
  arr.at(0);
}
