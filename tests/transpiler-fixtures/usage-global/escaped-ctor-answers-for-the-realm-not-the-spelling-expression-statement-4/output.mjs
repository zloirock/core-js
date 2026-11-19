import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url-search-params.constructor";
// A for-of shadow from an opaque iterable widens the global family only in usage-global.
function hand(x) {
  globalThis.taken = x;
}
for (const URL of list) hand(URL);
new URL('x');