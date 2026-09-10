// A carrier that OBSERVES the navigation's value (`||`, `&&`, `??`, both ternary arms) sits between a
// proxy-global receiver and the destructure that consumes it, and changes nothing: the run lands on the
// deepest span pure can back like any other receiver. A hop core-js ponyfills is never the environment
// probe - left raw it reads undefined off the ponyfill in exactly the realms the polyfill serves, while
// the polyfilled product answers there. A carrier that only PASSES the value on (a sequence tail) is the
// same answer. The pattern binds nothing polyfillable on purpose: this pins the receiver rendering, not
// the destructure claim. A distinct fallback constructor per line keeps each import attributable.
export const { observedByOr } = globalThis.self.Array || Set;
export const { observedByAnd } = globalThis.self.Array && Map;
export const { observedByNullish } = globalThis.self.Array ?? WeakMap;
export const { observedByTernaryConsequent } = cond ? globalThis.self.Array : Promise;
export const { observedByTernaryAlternate } = cond ? WeakSet : globalThis.self.Array;
export const { passedThroughBySequence } = (0, globalThis.self.Array);
