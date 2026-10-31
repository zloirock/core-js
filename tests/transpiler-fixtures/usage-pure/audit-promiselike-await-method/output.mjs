import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// PromiseLike<T> aliased to Promise via PROMISE_SYNONYMS  -  Awaited<PromiseLike<T[]>> should unwrap to T[]
async function probe() {
  const p: PromiseLike<string[]> = null!;
  const x = await p;
  _atMaybeArray(x).call(x, 0);
}