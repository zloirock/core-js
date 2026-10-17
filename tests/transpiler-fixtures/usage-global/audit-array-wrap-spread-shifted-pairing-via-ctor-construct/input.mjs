// A spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot no longer pairs EXACTLY with the
// literal init element at the same index - but every static element from the spread on is still a POSSIBLE slot value, and
// inject-if-might is sound here: a member read off the alias injects the union's method-aware set as a MAYBE.
let tail = globalThis.tail;
// ctor CONSTRUCTION through the maybe-alias: the single static candidate classifies the receiver,
// so the constructor modules inject; TWO distinct candidates stay ambiguous and inject nothing
const [c1, { URL: MC }] = [...tail, globalThis];
export const viaCtorConstruct = new MC(ctorSeed);
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
