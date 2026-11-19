// A kept store inside a claim-rebuilt argument still folds plain proxy navigation to self.
// The argument clone preserves its source origin, assignment and sequence effect once,
// both for a single call and for repeated calls in a loop.
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
