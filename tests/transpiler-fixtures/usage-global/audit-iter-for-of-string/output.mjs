import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `for (const ch of string)`: the iteration protocol on `String.prototype` must be
// polyfilled so the for-of loop has a working iterator.
for (const x of str) {}