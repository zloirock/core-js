import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A claimed element followed by another keeps the whole array wrapper: an effectful neighbour still
// runs after the claimed element's own prefix and a pure one is carried along, while the static is
// served by a literal in the claimed slot.
const seen = [];
const eff = t => (seen.push(t), t);
const [{
  Object: {
    fromEntries
  }
}] = [(eff('e'), globalThis), eff('f')];
const [{
  Promise: {
    allSettled
  }
}] = [(eff('g'), globalThis), 7];
export { fromEntries, allSettled, seen };