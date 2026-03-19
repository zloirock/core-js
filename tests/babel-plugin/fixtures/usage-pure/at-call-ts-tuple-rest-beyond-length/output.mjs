import _at from "@core-js/pure/actual/string/at";
type T = [number, ...string[]];
function f(x: T[2], y: T[5]) {
  _at(x).call(x, 0);
  _at(y).call(y, 0);
}