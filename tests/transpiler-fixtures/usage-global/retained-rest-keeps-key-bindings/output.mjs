import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Bound string keys and a well-known symbol keep their instance dispatch.
// Rest excludes all three consumed keys.
export function read(source) {
  const firstKey = 'at';
  const secondKey = 'flat';
  const {
    [firstKey]: first,
    [secondKey]: second,
    [Symbol.iterator]: iterator,
    ...rest
  } = source;
  return [first, second, iterator, rest];
}