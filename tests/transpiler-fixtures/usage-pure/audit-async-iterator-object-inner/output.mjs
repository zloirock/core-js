import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// AsyncIteratorObject<string[]> - async mirror of IteratorObject H03 case. `.at(0)`
// routes to Array-specific helper via inner `string[]` propagation through for-await-of
async function consume(it: AsyncIteratorObject<string[]>) {
  for await (const arr of it) _atMaybeArray(arr).call(arr, 0);
}
consume;