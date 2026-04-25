import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `AsyncIteratorObject<string[]>` - async mirror of the IteratorObject case. the element
// type `string[]` propagates through `for await...of`, narrowing `arr.at(0)` to the
// array-specific instance polyfill
async function consume(it: AsyncIteratorObject<string[]>) {
  for await (const arr of it) _atMaybeArray(arr).call(arr, 0);
}
consume;