import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an install of a dispatching prototype reaches a read of the binding only where it may run before it: a
// read ahead of it in a loop body comes after it on the next pass, so `at` dispatches on both families. the
// loop brings the iteration modules
const looped = [1, 2];
for (const x of xs) {
  use(looped.at(x));
  Object.setPrototypeOf(looped, String.prototype);
}