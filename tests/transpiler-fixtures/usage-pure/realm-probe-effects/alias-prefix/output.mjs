import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The sequence prefix runs before a nullable alias is read.
const effects = [];
export function read() {
  const held = _globalThis.window;
  return typeof (_pushMaybeArray(effects).call(effects, "prefix"), held.Promise, _Promise$resolve);
}