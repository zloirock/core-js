// A clean constructor assignment supplies a trusted hint for later static reads.
// The flat constructor may be replaced while the array-wrapped extraction keeps its native pattern.
let M;
({ Map: M } = globalThis);
export const r = typeof M.groupBy;
let A;
[{ Map: A }] = [globalThis];
export const q = typeof A.groupBy;
