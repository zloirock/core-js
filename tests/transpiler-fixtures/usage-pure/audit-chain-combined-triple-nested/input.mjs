// THREE optional levels in one chain: `arr.flat?.().map(x=>x).filter?.().reduce?.(...)`.
// the chain emit at the OUTERMOST polyfilled call (`.reduce?.()` in this shape) must
// `markIntermediateChainHops` through .filter, .filter?.() OptCall, .map and .map(...) Call
// so the visitor doesn't queue duplicate chain emits at each polyfilled intermediate.
// .reduce isn't optional-callable as outermost here so chain emit fires for `.filter+.flat?.()`
const arr = [1, 2];
arr.flat?.().map(x => x).filter?.().reduce?.((a: number, b: number) => a + b, 0).toString();
