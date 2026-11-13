import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  return typeof ((_pushMaybeArray(effects).call(effects, "prefix"), _globalThis).window.Promise, _Promise$resolve);
}