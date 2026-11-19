import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Computed-key effects precede lookup without sealing the optional call from its continuation.
export function read(get, key, argument, value = get()?.[key(), Symbol.iterator]?.(argument()).toString()) {
  return value;
}