import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A complete caller census supplies the same pristine realm through a literal spine.
const events = [];
function read({
  w: [{
    Array: {
      of,
      [(events.push('key'), 'from')]: from,
      length
    }
  }]
}) {
  return [of(4)[0], from([5])[0], length];
}
use(read({
  w: [globalThis]
}), events);