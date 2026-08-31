import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a kept store riding a claim-REBUILT argument keeps its guard: the instance dispatch clones
// the argument, and the clone still carries source provenance - the stored canon must admit
// it exactly like the in-place spelling, or the store folds to the ponyfill on one leg only
let held;
let seqE = 0;
const sink = [];
const utRoot = () => _globalThis;
export const inRebuiltArg = _pushMaybeArray(sink).call(sink, (held = null == (seqE++, utRoot()).window ? void 0 : _self)?.customQ);
export const inLoopRebuiltArg = (() => {
  for (let i = 0; i < 2; i++) _pushMaybeArray(sink).call(sink, (held = null == (seqE++, utRoot()).window ? void 0 : _self)?.customQ);
  return sink.length;
})();
export { held, seqE };