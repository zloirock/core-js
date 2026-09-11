// a BRANCHING static receiver in member form enumerates its branches like the destructure twin
// already did: each resolved branch's STATIC earns a side-effect import (the typeless primary
// resolves nothing for static-only keys, so both branches broke on old engines). one operator
// per line, distinct statics attribute a regressed form; the nested ternary flattens all leaves
export const viaTernary = (globalThis.cond ? Array : Iterator).from([1]);
export const viaLogicalOr = (globalThis.maybe || Promise).try;
export const viaNullish = (globalThis.maybe ?? Object).entries({});
export const viaIn = 'groupBy' in (globalThis.cond ? Map : Object);
export const viaNested = (globalThis.cond ? Number : (globalThis.deep ? Math : Object)).keys;
// a zero-arg IIFE returning the branching receiver flattens through the same walk (the gate is
// the walker's own branching probe, not a node-type test)
export const viaIife = (() => globalThis.cond ? Array : Iterator)().fromAsync;
