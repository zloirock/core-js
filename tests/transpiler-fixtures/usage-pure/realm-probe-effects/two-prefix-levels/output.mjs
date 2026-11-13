import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Prefixes at distinct receiver levels preserve their evaluation order.
const effects = [];
export function read() {
  const held = _globalThis.window;
  return typeof (_pushMaybeArray(effects).call(effects, "a"), _pushMaybeArray(effects).call(effects, "b"), held.self, _Promise$resolve);
}