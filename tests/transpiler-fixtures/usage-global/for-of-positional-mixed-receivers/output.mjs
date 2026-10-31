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
// Each positional leaf has its own type, even when an earlier leaf causes head relocation.
// Array at and string includes must not inherit one another's receiver type.
const rows = [[1], '02'];
for (const [{
  at
}, {
  includes
}] of [rows]) use(at, includes);