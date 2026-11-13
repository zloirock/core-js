import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// A throwing key stays live even when its nominal receiver is a realm.
const effects = [];
export function read() {
  function key() {
    effects.push("key");
    throw new RangeError();
  }
  return globalThis[key()].Math.abs(-3);
}