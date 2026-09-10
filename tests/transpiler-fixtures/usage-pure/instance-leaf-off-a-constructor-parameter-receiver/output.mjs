import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// an INSTANCE leaf destructured off a parameter whose receiver is a bare CONSTRUCTOR: the synth
// literal re-emits that receiver where no visitor reaches it again, so it arrives as the injected
// pure binding rather than the source name - which is what lets the mirror fire at all. `.name` is
// the shape: on the baseline `Function.prototype.name` is absent, so the raw read answers undefined
// where the helper answers the name. every host that pairs a parameter with a value spells it: an
// arrow IIFE, a function IIFE, and a parameter default. the mixed row proves the static leaf beside
// it keeps its own entry. the negatives are a proxy global with no entry of its own to arrive as
// (nothing to substitute, so the receiver stays the source's own read) and the array receiver, which
// names no global at all
export const viaArrowIife = (({
  name
}) => name)({
  name: _nameMaybeFunction(_Iterator)
});
export const viaFunctionIife = function ({
  name
}) {
  return name;
}({
  name: _nameMaybeFunction(_WeakSet)
});
export function viaParameterDefault({
  name
} = {
  name: _nameMaybeFunction(_Map)
}) {
  return name;
}
export const mixedWithAStatic = (({
  from,
  name
}) => [from, name])({
  from: _Iterator$from,
  name: _nameMaybeFunction(_Iterator)
});
// negatives
export const proxyWithNoEntry = (({
  name
}) => name)(window);
export const arrayReceiver = (({
  at
}) => at)({
  at: _atMaybeArray([1, 2])
});