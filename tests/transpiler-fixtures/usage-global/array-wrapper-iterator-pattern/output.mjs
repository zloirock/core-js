import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An iterator-keyed pattern inside an array reads its captured element once.
// The nested default and following sibling retain their native read order.
export function read(source) {
  const [{
    [Symbol.iterator]: {
      missing = fallback()
    },
    tail
  }] = [source];
  return [missing, tail];
}