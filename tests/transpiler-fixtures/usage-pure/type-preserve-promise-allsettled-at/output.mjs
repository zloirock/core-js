import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
async function f() {
  const arr = await _Promise$allSettled(p);
  return _atMaybeArray(arr).call(arr, -1);
}