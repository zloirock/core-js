import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(x: string | number[]) {
  _atInstanceProperty(x).call(x, -1);
}