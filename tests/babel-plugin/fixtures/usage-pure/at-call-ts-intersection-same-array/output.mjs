import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(x: number[] & ReadonlyArray<number>) {
  _atInstanceProperty(x).call(x, -1);
}