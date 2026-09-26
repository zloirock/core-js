import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Static extractions retain their rest exclusions; a sibling must not reclaim the sentinel.
const [{
  'from': from,
  ...rest
}, tail] = [Array, 1];
const [{
  [Symbol.iterator]: iterator,
  of,
  ...remaining
}] = [Array];
export const r = [from([tail]), of(2), typeof iterator, Object.hasOwn(rest, 'from'), Object.hasOwn(remaining, 'of')];