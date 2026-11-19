// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
// a slot BEFORE the spread pairs exactly while its sibling AFTER pairs as a maybe - both inject;
// a spread with NO static candidates enumerates nothing and injects nothing
const [{ Float16Array: F16 }, { AggregateError: AG }] = [globalThis, ...tail, globalThis];
export const viaMixedPositions = [F16, new AG([], 'x')];
