import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Keep the source guard and distinguish realm values from user properties.
function get() {
  effect();
  return globalThis.window;
}
export const r = get()?.Array?.[keyEffect(), "from"]((argumentEffect(), [3]));