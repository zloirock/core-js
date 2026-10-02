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
// A write through the catch binding changes the original container.
// The old positional initializer cannot select a single receiver family.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  e[0] = "ab";
}
const [{
  at
}] = rows;
use(at);