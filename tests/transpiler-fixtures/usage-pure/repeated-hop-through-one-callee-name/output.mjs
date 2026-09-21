import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// Reaching a value through the SAME callee name twice is no cycle: an argument is a sibling
// sub-expression of a finite tree, so it resolves in the context the call was reached in and the
// descent ends on its own. A binding that truly cycles still answers nothing, and reading the cycle
// set as if the name alone made one lost the polyfill on every repeated hop.
function pick(v) {
  return v;
}
const cycleA = () => cycleB();
const cycleB = () => cycleA();
export const oneHop = _Array$of(1);
export const twoHops = (pick(pick(_Map)), _Map$groupBy)([2], x => x);
export const threeHops = (pick(pick(pick(_Promise))), _Promise$withResolvers)();
export const cyclic = cycleA().from([3]);