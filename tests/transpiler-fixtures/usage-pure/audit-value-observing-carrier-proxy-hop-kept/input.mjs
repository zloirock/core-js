// A carrier that OBSERVES the navigation's value (`||`, `&&`, `??`, both ternary arms) sits between a
// proxy-global receiver and the destructure that consumes it. On a realm without `self` the source reads
// an undefined hop and THROWS before the fallback is reached, so the intermediate hop must survive the
// rewrite - collapsing it to the bare root would silently hand the fallback a value the source never
// produces. A carrier that only PASSES the value through (a sequence tail) observes nothing, so there the
// hop still collapses. The pattern binds nothing polyfillable on purpose: this pins the receiver rendering,
// not the destructure claim. A distinct fallback constructor per line keeps each import attributable.
export const { observedByOr } = globalThis.self.Array || Set;
export const { observedByAnd } = globalThis.self.Array && Map;
export const { observedByNullish } = globalThis.self.Array ?? WeakMap;
export const { observedByTernaryConsequent } = cond ? globalThis.self.Array : Promise;
export const { observedByTernaryAlternate } = cond ? WeakSet : globalThis.self.Array;
export const { passedThroughBySequence } = (0, globalThis.self.Array);
