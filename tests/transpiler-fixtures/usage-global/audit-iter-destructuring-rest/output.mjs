import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// iterable destructure with rest `[a, ...rest] = iter`: the iteration protocol must
// be polyfilled because the rest pattern consumes the iterator.
const [a, ...rest] = arr;