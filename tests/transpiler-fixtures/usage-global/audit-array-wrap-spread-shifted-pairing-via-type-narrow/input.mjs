// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// type channel: A is not PROVABLY Array, `.at` injects both the array and the string leg
const [a0, { Array: A }] = [...tail, globalThis];
export const viaTypeNarrow = new A().at(0);
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
