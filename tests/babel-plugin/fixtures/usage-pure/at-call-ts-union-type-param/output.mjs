import _at from "@core-js/pure/actual/instance/at";
function foo(x: string | number[]) {
  _at(x).call(x, -1);
}