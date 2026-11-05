import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An iterator read on the realm keeps its fallback when the method is absent.
// Pure dispatch reads the polyfilled realm; global mode retains the native pattern.
const {
  [Symbol.iterator]: iterator = fallback()
} = globalThis;
use(iterator);