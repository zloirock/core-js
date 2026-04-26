import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `for (const x of array)`: the iteration protocol on `Array.prototype` must be
// polyfilled so the for-of loop has a working iterator.
for (const x of arr) {}