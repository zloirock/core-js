import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A try block can replace the array held by an alias before a nested pattern reads it.
// A substituted namespace must retain the static that the unresolved pattern reads.
let viaTry = [Array];
try {
  viaTry = [Reflect];
} catch (e) {
  void e;
}
const [{
  ownKeys
}] = viaTry;
export const tryWrite = ownKeys({});