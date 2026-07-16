// a spread BEFORE an array-wrap slot shifts every later runtime position, so the pattern slot
// no longer pairs EXACTLY with the literal init element at the same index - but every static
// element from the spread on is still a POSSIBLE slot value, and inject-if-might is sound here:
// a member read off the alias injects the union's method-aware set as a MAYBE. the type channel
// still must not NARROW a spread-shifted binding: `.at` on a foreign runtime receiver keeps BOTH
// the array and the string leg (narrowing to the array leg alone under-injects the string polyfill)
let tail = [{}, {}];

// ctor-alias member channel: M MIGHT be the global Map (a length-1 spread pairs it), so the
// method-aware maybe-set injects
const [m0, { Map: M }] = [...tail, globalThis];
export const viaCtorAlias = M.groupBy([1, 2], v => v);

// symbol-alias channel: S MIGHT be the global Symbol - the well-known-symbol modules and the
// ctor modules inject
const [s0, { Symbol: S }] = [...tail, globalThis];
export const viaSymbolAlias = [1, 2][S.iterator];

// ctor CONSTRUCTION through the maybe-alias: the single static candidate classifies the receiver,
// so the constructor modules inject; TWO distinct candidates stay ambiguous and inject nothing
const [c1, { Map: MC }] = [...tail, globalThis];
export const viaCtorConstruct = new MC(ctorSeed);
const [c2, { WeakSet: WS }] = [...tail, globalThis, otherHolder];
export const viaTwoCandidatesBail = new WS();

// type channel: A is not PROVABLY Array, `.at` injects both the array and the string leg
const [a0, { Array: A }] = [...tail, globalThis];
export const viaTypeNarrow = new A().at(0);

// deep array-wrap layers: the spread shifts the INNER level - the maybe-union recurses the same way
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

// a UNION candidate contributes each arm: an all-proxy ternary or `||` collapses to the one
// canonical global; a diverging union still injects by its resolving arm (inject-if-might);
// an `&&` guard stays whole - its falsy LEFT is the expression's value, never collapsible
const [u1, { Reflect: RA }] = [...tail, pick ? globalThis : self];
export const viaShiftedUnionArms = RA.ownKeys({});
const [u2, { Proxy: PD }] = [...tail, pick ? globalThis : foreignHolder];
export const viaShiftedDivergingArm = new PD({}, {});
const [u3, { DataView: DV }] = [...tail, cond && globalThis];
export const viaShiftedAndStaysWhole = new DV(buf);

// arms recurse through NESTED unions; a sequence candidate resolves through its tail; the
// assignment-form destructure pairs the same way the declarator form does
const [, { Uint8Array: U8 }] = [...tail, deep ? (deeper ? globalThis : self) : window];
export const viaNestedUnionArms = U8.fromBase64;
const [, { structuredClone: SC }] = [...tail, (mark(), globalThis)];
export const viaSequenceCandidate = SC;
let AB;
([, { DOMException: AB }] = [...tail, globalThis]);
export const viaAssignmentForm = new AB('x');

// a slot BEFORE the spread pairs exactly while its sibling AFTER pairs as a maybe - both inject;
// a spread with NO static candidates enumerates nothing and injects nothing
const [{ Float16Array: F16 }, { AggregateError: AG }] = [globalThis, ...tail, globalThis];
export const viaMixedPositions = [F16, new AG([], 'x')];
const [, { Atomics: AT }] = [...tail];
export const viaNoCandidates = AT.pause;

