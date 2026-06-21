import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// async generator annotated with `AsyncIterable<T>` (async sibling of Iterable<T>).
// the generator-like name set must include it, else yield-type extraction fails and
// the branch emits `AsyncIterator<null>`. with it recognized, the yield type is
// recovered, for-await-of binds `arr` to `number[]`, and `arr.at(0)` hits the array path.
async function* gen(): AsyncIterable<number[]> {
  yield [1, 2, 3];
  yield [4, 5];
}
async function probe() {
  for await (const arr of gen()) {
    _atMaybeArray(arr).call(arr, 0);
  }
}
probe();