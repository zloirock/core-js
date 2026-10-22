import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The computed key short-circuits with its receiver; the sealed call still runs its argument.
// Each default evaluation owns the captured receiver, including a reentrant getter.
export function read(get, key, argument, value = (get()?.[key(), Symbol.iterator])(argument())) {
  return value;
}