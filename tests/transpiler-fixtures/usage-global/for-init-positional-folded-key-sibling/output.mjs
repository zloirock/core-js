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
// The whole declaration keeps a positional instance read and its native sibling in order.
const K = 'at';
function* source(value) {
  yield value;
}
export function read() {
  for (const [{
    [K]: at,
    length
  }] = source([3, 7]);;) return [at, length];
}