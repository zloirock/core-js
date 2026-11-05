// Spread-shifted slots denote possible constructors, so later statics need identity guards.
// Native construction and nested property reads retain the actual runtime element.
let tail = [{}, {}];

// static member off the maybe-alias: no substitution, the identity guard reads the runtime value
const [, { Iterator: S }] = [...tail, globalThis];
export const viaStaticRead = S.from;

// ctor construction through the maybe-alias stays verbatim too
const [, { Map: M }] = [...tail, globalThis];
export const viaCtorConstruct = new M([[1, 2]]);

// nested pattern past the spread: the recursion reports the shift, the leaf's static read is guarded
const [, [{ Promise: P }]] = [...tail, [{ Promise: globalThis.Promise }]];
export const viaNestedShift = P.allSettled([]);

// A slot before the spread keeps its native constructor read and the following iteration.
const [{ WeakSet: W }] = [globalThis, ...tail];
export const viaPreSpreadExact = new W();

// a union candidate in the shifted slot changes nothing for pure: the shift alone already
// poisons certainty, all-proxy arms included - the guard tests the one candidate it can name
const [, { Symbol: SY }] = [...tail, flip ? globalThis : self];
export const viaShiftedUnionPure = SY.asyncIterator;
