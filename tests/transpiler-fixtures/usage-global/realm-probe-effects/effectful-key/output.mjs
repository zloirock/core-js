import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A key with effects stays live and runs once.
const effects = [];
export function read() {
  function key() {
    effects.push("key");
    return "self";
  }
  return globalThis[key()].Math.abs(-3);
}