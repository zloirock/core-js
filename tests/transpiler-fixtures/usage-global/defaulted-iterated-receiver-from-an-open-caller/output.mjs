import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An open iterated slot dispatches the supplied receiver; its default stays on the native binding.
export function read(input) {
  const [{
    at
  } = [1]] = input;
  return at.call('ok', 0);
}
export const result = read(['text']);