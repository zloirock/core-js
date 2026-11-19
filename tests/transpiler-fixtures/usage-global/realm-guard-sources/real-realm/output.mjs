import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// Keep the source guard and distinguish realm values from user properties.
function get() {
  return globalThis.self;
}
export const r = get().Array.from([3]);