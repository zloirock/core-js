import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A shared nested receiver is captured once before its independent property reads.
// Native siblings keep their position; each typed method keeps its own polyfill.
const [{
  w: {
    at,
    length
  },
  y: {
    includes
  }
}] = [{
  w: [2, 7],
  y: 'abc'
}, mark()];
use(at, length, includes);