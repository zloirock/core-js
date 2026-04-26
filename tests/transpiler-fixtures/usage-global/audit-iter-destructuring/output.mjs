import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// iterable array-pattern destructure: the iteration protocol must be polyfilled
// because destructuring an iterable invokes the iterator protocol at runtime.
const [a, b] = arr;