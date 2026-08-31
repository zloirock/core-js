// a kept store riding a claim-REBUILT argument keeps its guard: the instance dispatch clones
// the argument, and the clone still carries source provenance - the stored canon must admit
// it exactly like the in-place spelling, or the store folds to the ponyfill on one leg only
let held;
let seqE = 0;
const sink = [];
const utRoot = () => globalThis;
export const inRebuiltArg = sink.push((held = (seqE++, utRoot()).window.self)?.customQ);
export const inLoopRebuiltArg = (() => {
  for (let i = 0; i < 2; i++) sink.push((held = (seqE++, utRoot()).window.self)?.customQ);
  return sink.length;
})();
export { held, seqE };
