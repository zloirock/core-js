// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// a UNION candidate contributes each arm: an all-proxy ternary or `||` collapses to the one
// canonical global; a diverging union still injects by its resolving arm (inject-if-might);
// an `&&` guard stays whole - its falsy LEFT is the expression's value, never collapsible
const [u1, { Reflect: RA }] = [...tail, pick ? globalThis : self];
export const viaShiftedUnionArms = RA.ownKeys({});
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
