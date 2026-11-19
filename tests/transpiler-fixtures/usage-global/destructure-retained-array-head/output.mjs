import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An empty argument element selects the nested default. Keep native parameter reads
// inside the iterator; the static binding is served before the original body runs.
function f([{
  from,
  [(effect(), 'unknown')]: x
} = Array]) {
  return [from, x];
}
f([void 0]);