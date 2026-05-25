// `cond ? (0, Array) : Iterator` per-branch synth-swap previously bailed on the SE-wrapped
// branch (the runtime peel didn't strip a safe SE tail), leaving native `Array.from` -
// "polyfill always wins" violation. usage-global emits polyfill imports per branch, both
// `es.array.from` and `es.iterator.from` should be in the polyfill set
const { from } = Math.random() > 0.5 ? (0, Array) : Iterator;
from([1, 2, 3]);
