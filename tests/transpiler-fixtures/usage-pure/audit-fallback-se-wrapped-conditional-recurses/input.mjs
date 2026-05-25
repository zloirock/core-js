// `(logCall(), cond ? Array : Iterator)` - SE wraps the WHOLE conditional. peel must reach
// the inner conditional unconditionally (SE prefix preserved via per-branch substitution
// around the inner Identifier), then recurse into each branch. without SE peel at the
// receiver level, branch detection bailed and neither side got synth-swap
declare function logCall(): void;
const { from } = (logCall(), cond ? Array : Iterator);
from([1, 2, 3]);
