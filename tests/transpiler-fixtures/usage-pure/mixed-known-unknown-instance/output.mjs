import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
function f(arr: number[], unknown) {
  _atMaybeArray(arr).call(arr, 0);
  _at(unknown).call(unknown, 0);
}