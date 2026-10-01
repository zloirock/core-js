import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A kept store inside a claim-rebuilt argument still folds plain proxy navigation to self.
// The argument clone preserves its source origin, assignment and sequence effect once,
// both for a single call and for repeated calls in a loop.
let held;
let seqE = 0;
const sink = [];
const utRoot = () => _globalThis;
export const inRebuiltArg = _pushMaybeArray(sink).call(sink, (held = (seqE++, _self))?.customQ);
export const inLoopRebuiltArg = (() => {
  for (let i = 0; i < 2; i++) _pushMaybeArray(sink).call(sink, (held = (seqE++, _self))?.customQ);
  return sink.length;
})();
export { held, seqE };