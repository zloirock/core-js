import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Reaching a value through the SAME callee name twice is no cycle: an argument is a sibling
// sub-expression of a finite tree, so it resolves in the context the call was reached in and the
// descent ends on its own. A binding that truly cycles still answers nothing, and reading the cycle
// set as if the name alone made one lost the polyfill on every repeated hop.
function pick(v) {
  return v;
}
const cycleA = () => cycleB();
const cycleB = () => cycleA();
export const oneHop = pick(Array).of(1);
export const twoHops = pick(pick(Map)).groupBy([2], x => x);
export const threeHops = pick(pick(pick(Promise))).withResolvers();
export const cyclic = cycleA().from([3]);