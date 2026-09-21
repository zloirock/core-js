// Reaching a value through the SAME callee name twice is no cycle: an argument is a sibling
// sub-expression of a finite tree, so it resolves in the context the call was reached in and the
// descent ends on its own. A binding that truly cycles still answers nothing, and reading the cycle
// set as if the name alone made one lost the polyfill on every repeated hop.
function pick(v) { return v; }
const cycleA = () => cycleB();
const cycleB = () => cycleA();
export const oneHop = pick(Array).of(1);
export const twoHops = pick(pick(Map)).groupBy([2], x => x);
export const threeHops = pick(pick(pick(Promise))).withResolvers();
export const cyclic = cycleA().from([3]);
