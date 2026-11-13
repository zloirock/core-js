import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A key with effects stays live and runs once.
const effects = [];
export function read() {
  function key() {
    _pushMaybeArray(effects).call(effects, "key");
    return "self";
  }
  return _globalThis[key()].Math.abs(-3);
}