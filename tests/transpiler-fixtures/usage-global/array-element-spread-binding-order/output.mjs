import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A known slot before an opaque spread keeps its instance polyfill.
// The spread evaluates first; getter reads and bindings then follow source order.
export function read(make, values) {
  const [before, {
    at
  }, ...rest] = [2, make(() => [before, rest]), ...values];
  return [before, at, rest];
}