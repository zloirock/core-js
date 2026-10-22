import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An optional symbol call keeps receiver capture and computed-key effects in the same frame.
export function read(get, key, argument, value = get()?.[key(), Symbol.iterator]?.(argument())) {
  return value;
}