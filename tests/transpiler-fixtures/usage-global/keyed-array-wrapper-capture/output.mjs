import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An array host can wrap a keyed array level with prototype navigation.
// Both methods read the captured prototype before the sibling write completes.
let at, flat, tail;
[{
  w: [{
    prototype: {
      at,
      flat
    }
  }]
}, tail] = [{
  w: [Array]
}, 7];
use(at, flat, tail);