import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A carrier that OBSERVES the navigation's value (`||`, `&&`, `??`, both ternary arms) sits between a
// proxy-global receiver and the destructure that consumes it, and changes nothing: the run lands on the
// deepest span pure can back like any other receiver. A hop core-js ponyfills is never the environment
// probe - left raw it reads undefined off the ponyfill in exactly the realms the polyfill serves, while
// the polyfilled product answers there. A carrier that only PASSES the value on (a sequence tail) is the
// same answer. The pattern binds nothing polyfillable on purpose: this pins the receiver rendering, not
// the destructure claim. A distinct fallback constructor per line keeps each import attributable.
export const {
  observedByOr
} = _self.Array || _Set;
export const {
  observedByAnd
} = _self.Array && _Map;
export const {
  observedByNullish
} = _self.Array ?? _WeakMap;
export const {
  observedByTernaryConsequent
} = cond ? _self.Array : _Promise;
export const {
  observedByTernaryAlternate
} = cond ? _WeakSet : _self.Array;
export const {
  passedThroughBySequence
} = (0, _self.Array);