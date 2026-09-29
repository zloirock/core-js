import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A dominating realm initializer permits a named static read without a constructor namespace.
var g = _globalThis;
function f() {
  return _Promise$resolve(1);
}
export const result = typeof f().then;