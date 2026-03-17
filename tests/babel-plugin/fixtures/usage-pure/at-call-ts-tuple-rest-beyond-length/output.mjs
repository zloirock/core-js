import _atInstanceProperty from "@core-js/pure/actual/instance/at";
type T = [number, ...string[]];
function f(x: T[2], y: T[5]) {
  _atInstanceProperty(x).call(x, 0);
  _atInstanceProperty(y).call(y, 0);
}