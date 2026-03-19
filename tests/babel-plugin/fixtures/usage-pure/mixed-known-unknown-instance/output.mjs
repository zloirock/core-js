import _at from "@core-js/pure/actual/array/at";
import _at2 from "@core-js/pure/actual/instance/at";
function f(arr: number[], unknown) {
  _at(arr).call(arr, 0);
  _at2(unknown).call(unknown, 0);
}