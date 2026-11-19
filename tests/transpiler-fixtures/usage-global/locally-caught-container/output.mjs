import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Throwing into a local catch keeps the container in this execution.
// Unused and read-only catch bindings do not invalidate positional array receivers.
const rows = [[1, 2]];
try {
  throw rows;
} catch (e) {
  void e.length;
}
const [{
  at
}] = rows;
use(at);