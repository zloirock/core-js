import _at from "@core-js/pure/actual/instance/at";
// combo: async generator yields an iterable + for-await-of iterates it + the inner body
// uses optional `.at?.(-1)` on the yielded value. instance.at polyfill composes with the
// optional call guard around a for-await-of-bound identifier
async function* gen() {
  yield [1, 2, 3];
}
async function run() {
  for await (const arr of gen()) {
    _at(arr)?.call(arr, -1);
  }
}