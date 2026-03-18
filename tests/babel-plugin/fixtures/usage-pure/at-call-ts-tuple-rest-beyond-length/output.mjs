import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type T = [number, ...string[]];
function f(x: T[2], y: T[5]) {
  _atMaybeString(x).call(x, 0);
  _atMaybeString(y).call(y, 0);
}