import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
import "core-js/modules/web.dom-collections.iterator";
// An OPAQUE iterable enumerates no value the resolver can name, so the rebound alias may hold ANYTHING at the use - including a
// string, whose instance method needs the polyfill off target.
let V = Object;
for (V of gen()) {
  break;
}
V.replaceAll(other);