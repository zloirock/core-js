import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(x: readonly number[]) {
  _atInstanceProperty(x).call(x, -1);
}