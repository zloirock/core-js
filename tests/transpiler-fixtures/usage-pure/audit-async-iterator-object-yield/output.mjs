import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// TS 5.6+ AsyncIteratorObject<TYield, TReturn, TNext>: yielded value type для async-gen
// resolves through param-0 (TYield); narrowed to array on consumption side
async function* gen(): AsyncIteratorObject<number[], void, void> {
  yield [1, 2, 3];
}
async function consume() {
  for await (const arr of gen()) {
    _atMaybeArray(arr).call(arr, 0);
    _includesMaybeArray(arr).call(arr, 1);
  }
}
consume();