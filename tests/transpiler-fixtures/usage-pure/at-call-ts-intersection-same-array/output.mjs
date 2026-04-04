import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function foo(x: number[] & ReadonlyArray<number>) {
  _atMaybeArray(x).call(x, -1);
}