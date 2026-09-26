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
// Each iterator occurrence reads independently, in source order with native and instance siblings.
export function read(receiver) {
  const [{
    [Symbol.iterator]: first,
    other,
    at,
    [Symbol.iterator]: second
  }] = [receiver];
  return [first, other, at, second];
}