import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
export function read() {
  let held;
  return typeof ((held = _self).window.Promise, _Promise$resolve);
}