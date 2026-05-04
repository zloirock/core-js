// Proxy-global member used as destructure receiver: the inner `globalThis` Identifier
// must be skipped by both pipelines after synth-swap rewrites the outer chain to a
// literal. Multiple receivers in the same file lock the markSynthReceiverSkipped
// helper across both branches.
const { from } = globalThis.Array;
const { of } = globalThis.self.Array;
const a = from('a');
const b = of(1, 2);
a.findLast(x => x);
b.flat();
