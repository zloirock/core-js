// usage-pure twin of the branching-static member forms: pure substitutes no branching static member, so
// the reads stay raw but for the bare constructor identifiers each branch substitutes on its own - with
// the whole entry, whose statics the raw read then finds - and an arm core-js ships no replacement of,
// whose static the identity guard serves off the captured selection, a key any receiver may carry as an
// instance method (`entries`) taking that dispatch in the raw branch
export const viaTernary = (globalThis.cond ? Array : Iterator).from([1]);
export const viaLogicalOr = (globalThis.maybe || Promise).try;
export const viaNullish = (globalThis.maybe ?? Object).entries({});
export const viaIn = 'groupBy' in (globalThis.cond ? Map : Object);
export const viaNested = (globalThis.cond ? Number : (globalThis.deep ? Math : Object)).keys;
// a zero-arg IIFE returning the branching receiver keeps its read native: a selection a call returns
// is no guard's (its arms still substitute on their own)
export const viaIife = (() => globalThis.cond ? Array : Iterator)().fromAsync;
