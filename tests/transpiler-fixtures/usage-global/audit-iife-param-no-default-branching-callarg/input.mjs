// an IIFE destructure param WITHOUT a default, invoked with a branching call-arg:
// the call-arg is the only receiver source, so the call-site walk lifts it at the
// param's index and per-branch enumeration injects each branch's static polyfill.
// distinct keys trace each line.
export const a = (({ from }) => from([1]))(globalThis.cond ? Array : Iterator);

export const b = (({ groupBy }) => groupBy([1, 2], it => it % 2))(globalThis.cond ? Map : Object);
