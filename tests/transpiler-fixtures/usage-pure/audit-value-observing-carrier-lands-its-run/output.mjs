import _DisposableStack from "@core-js/pure/actual/disposable-stack/constructor";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A carrier that OBSERVES the navigation's value (`||`, `&&`, `??`, both ternary arms) sits between a
// proxy-global receiver and the destructure that consumes it, and changes nothing: the run lands on the
// deepest span pure can back like any other receiver. A hop core-js ponyfills is never the environment
// probe - left raw it reads undefined off the ponyfill in exactly the realms the polyfill serves, while
// the polyfilled product answers there. A carrier that only PASSES the value on (a sequence tail) is the
// same answer. The pattern binds nothing polyfillable on purpose: this pins the receiver rendering, not
// the destructure claim. A distinct fallback constructor per line keeps each import attributable; over a
// left the build serves the `||` / `??` carrier folds away, and over one it does not it stays (`WeakRef`).
export const {
  observedByOr
} = _self.Array;
export const {
  observedByAnd
} = _self.Array && _Map;
export const {
  observedByNullish
} = _self.Array;
export const {
  observedByTernaryConsequent
} = cond ? _self.Array : _Promise;
export const {
  observedByTernaryAlternate
} = cond ? _WeakSet : _self.Array;
export const {
  passedThroughBySequence
} = (0, _self.Array);
export const {
  observedByUnservedOr
} = _self.WeakRef || _Iterator;
export const {
  observedByUnservedNullish
} = _self.WeakRef ?? _DisposableStack;