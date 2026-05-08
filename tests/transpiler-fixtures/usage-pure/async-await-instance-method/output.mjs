import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise$all from "@core-js/pure/actual/promise/all";
async function f() {
  const arr = await _Promise$all(promises);
  return _atMaybeArray(arr).call(arr, -1);
}