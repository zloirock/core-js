// `(logCall(), cond ? Array : Iterator)` - SE wraps the WHOLE conditional. peel must reach
// the inner conditional unconditionally (SE prefix preserved via per-branch substitution
// around the inner Identifier), then recurse into each branch. without SE peel at the
// receiver level, branch detection bailed and neither side got synth-swap
declare function logCall(): void;
const { from } = (logCall(), cond ? Array : Iterator);
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
from([1, 2, 3]);
