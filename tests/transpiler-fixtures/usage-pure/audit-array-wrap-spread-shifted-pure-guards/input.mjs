// a spread-shifted array-wrap slot pairs a POSSIBLE value, not a certain one (the spread's own
// items are unenumerable), so pure's receiver-dropping rewrite must not treat the lone enumerated
// candidate as the binding's value: at runtime the slot may hold any spread element, and a
// substituted pure binding would compute the wrong value. a static read off the maybe-alias takes
// the runtime identity guard against that candidate - the raw branch reads the runtime value -
// while a construction and a nested-pattern leaf keep their spelling
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

// CONTROL: a slot strictly BEFORE the spread pairs exactly and still resolves - the residual stays,
// since the spread ITERATES and no rescue re-emits that
const [{ WeakSet: W }] = [globalThis, ...tail];
export const viaPreSpreadExact = new W();

// a union candidate in the shifted slot changes nothing for pure: the shift alone already
// poisons certainty, all-proxy arms included - the guard tests the one candidate it can name
const [, { Symbol: SY }] = [...tail, flip ? globalThis : self];
export const viaShiftedUnionPure = SY.asyncIterator;

