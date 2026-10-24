// an INSTANCE leaf destructured off a parameter whose receiver is a bare CONSTRUCTOR: the synth
// literal re-emits that receiver where no visitor reaches it again, so it arrives as the injected
// pure binding rather than the source name - which is what lets the mirror fire at all. `.name` is
// the shape: on the baseline `Function.prototype.name` is absent, so the raw read answers undefined
// where the helper answers the name. every host that pairs a parameter with a value spells it: an
// arrow IIFE, a function IIFE, and a parameter default. the mixed row proves the static leaf beside
// it keeps its own entry. the negatives are a proxy global with no entry of its own to arrive as
// (nothing to substitute, so the receiver stays the source's own read) and the array receiver, which
// names no global at all
export const viaArrowIife = (({ name }) => name)(Iterator);
export const viaFunctionIife = (function ({ name }) { return name; })(WeakSet);
export function viaParameterDefault({ name } = Map) {
  return name;
}
export const mixedWithAStatic = (({ from, name }) => [from, name])(Iterator);
// negatives
export const proxyWithNoEntry = (({ name }) => name)(window);
export const arrayReceiver = (({ at }) => at)([1, 2]);
