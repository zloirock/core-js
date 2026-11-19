import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A user consumer does not own the throwing read of its effectful realm argument.
import name from "@core-js/pure/actual/function/instance/name";
const effects = [];
export function read() {
  return typeof name(((_pushMaybeArray(effects).call(effects, "prefix"), _globalThis).window.Promise, _Promise));
}