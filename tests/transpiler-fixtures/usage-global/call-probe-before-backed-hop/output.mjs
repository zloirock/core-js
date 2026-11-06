import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A backed realm hop does not prove that the earlier call yielded a defined value.
// Capturing the call keeps the guard on that yield before the static and instance claims.
function read() {
  return globalThis.window;
}
export const value = String(read().self?.window.Array.of(32).at(0));