import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Every nested receiver prefix runs before the optional test, including its absent arm.
const effects = [];
export function read() {
  const resolve = ((_pushMaybeArray(effects).call(effects, "a"), _pushMaybeArray(effects).call(effects, "b"), null == _globalThis.window ? void 0 : _Promise).resolve, _Promise$resolve);
  return typeof resolve;
}