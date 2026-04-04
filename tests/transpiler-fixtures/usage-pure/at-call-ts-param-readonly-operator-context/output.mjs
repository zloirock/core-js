import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function foo(x: readonly number[]) {
  _atMaybeArray(x).call(x, -1);
}