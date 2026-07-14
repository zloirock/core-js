// a spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot
// no longer pairs with the literal init element at the same index. the type channel must not
// narrow a spread-shifted binding: `.at` on a foreign runtime receiver injects BOTH the array
// and the string leg (narrowing to the array leg alone under-injects the string polyfill).
// unresolvable ctor/symbol aliases inject nothing - the alias may be any spread element
let tail = [{}, {}];

// ctor-alias channel: M is not provably the global Map, no map statics inject
const [m0, { Map: M }] = [...tail, globalThis];
export const viaCtorAlias = M.groupBy([1, 2], v => v);

// symbol-alias channel: S is not provably the global Symbol
const [s0, { Symbol: S }] = [...tail, globalThis];
export const viaSymbolAlias = [1, 2][S.iterator];

// type channel: A is not provably Array, `.at` injects both the array and the string leg
const [a0, { Array: A }] = [...tail, globalThis];
export const viaTypeNarrow = new A().at(0);

// deep array-wrap layers: the spread shifts the INNER level, the recursion bails the same way
const [[i0, { Iterator: I }]] = [[...tail, globalThis]];
export const viaDeepSpread = I.range(0, 3);

// spread AT the slot bails too (position is runtime-determined from the spread on)
let head = [globalThis];
const [{ Promise: P }] = [...head];
export const viaSpreadAt = P.allSettled([]);

// control: a spread strictly AFTER the slot keeps earlier positions static - the sound slot
// resolves and its constructor modules inject; the sibling slot AT the spread stays unresolvable
const [{ Set: C }, { WeakMap: W }] = [globalThis, ...tail];
export const viaSpreadAfter = new C(afterSeed);
export const viaSlotAtSpread = new W();
