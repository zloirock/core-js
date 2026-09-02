import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A carrier that OBSERVES the navigation's value (`||`, `&&`, `??`, both ternary arms) sits between a
// proxy-global receiver and the destructure that consumes it. On a realm without `self` the source reads
// an undefined hop and THROWS before the fallback is reached, so the intermediate hop must survive the
// rewrite - collapsing it to the bare root would silently hand the fallback a value the source never
// produces. A carrier that only PASSES the value through (a sequence tail) observes nothing, so there the
// hop still collapses. The pattern binds nothing polyfillable on purpose: this pins the receiver rendering,
// not the destructure claim. A distinct fallback constructor per line keeps each import attributable.
export const {
  observedByOr
} = _globalThis.self.Array || _Set;
export const {
  observedByAnd
} = _globalThis.self.Array && _Map;
export const {
  observedByNullish
} = _globalThis.self.Array ?? _WeakMap;
export const {
  observedByTernaryConsequent
} = cond ? _globalThis.self.Array : _Promise;
export const {
  observedByTernaryAlternate
} = cond ? _WeakSet : _globalThis.self.Array;
export const {
  passedThroughBySequence
} = (0, _self.Array);