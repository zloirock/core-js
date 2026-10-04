// A nested instance-method assignment writes the helper result after evaluating its RHS.
// A defaulted binding (`m = []`) is an AssignmentPattern; it still receives the method read.
// The guard evaluates its fallback only if the helper result is undefined.
declare const a: number[];
declare const b: string[];
declare const c: number[];
let m, n, o, other;
[{ flat: m = [] }] = [a];
[{ at: n = 0 }] = [b];
// A sibling element keeps its own assignment after the method read.
[{ findLast: o = null }, other] = [c, 1];
