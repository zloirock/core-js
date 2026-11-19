import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// Source order alone cannot narrow a deferred call across a global write.
export function read() {
  return Object.keys(input).at(-1);
}
if (flag) globalThis.Object = other;