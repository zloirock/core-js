import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A throwing key stays live even when its nominal receiver is a realm.
const effects = [];
export function read() {
  function key() {
    _pushMaybeArray(effects).call(effects, "key");
    throw new RangeError();
  }
  return _globalThis[key()].Math.abs(-3);
}