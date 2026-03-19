import _at from "@core-js/pure/actual/array/at";
function foo(x: number[]) {
  _at(x).call(x, -1);
}