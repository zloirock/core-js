import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// peelIIFEReturn requires zero-param callee. `(x => arr)(unrelated)` invokes the
// inline function with an arg even though body returns `arr` unchanged. The runtime
// shape uses the param scope so peeling is unsafe (receiver-name resolution would
// mis-bind through the body if param were shadowed). Confirm bail keeps polyfill
// emission tied to the visible call expression rather than the inner identifier.
const arr = [1, 2, 3];
const peeled = (x => arr)(99);
_atMaybeArray(peeled).call(peeled, 0);