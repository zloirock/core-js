import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A live optional call keeps its following member inside the guarded chain.
export function read(a) {
  return globalThis.window?.Array.from(a).foo?.().bar;
}