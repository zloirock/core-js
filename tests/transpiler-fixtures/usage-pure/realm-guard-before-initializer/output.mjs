import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A closure declared before the realm initializer retains the constructor's static family.
function f() {
  return (g === _globalThis ? _Promise : g.Promise).resolve(1);
}
var g = _globalThis;
export const result = typeof f().then;