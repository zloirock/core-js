import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Agreement retains symbol provenance through shared alias arms.
const k0 = Symbol.iterator;
const k1 = Symbol.iterator;
const k2 = first() ? k1 : k0;
const k3 = second() ? k2 : k1;
[3][k3]();