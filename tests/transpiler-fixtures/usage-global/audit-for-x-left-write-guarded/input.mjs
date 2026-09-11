// a write nested in a for-x LEFT runs 0+ times (the zero-iteration path keeps the
// pre-loop value), so it must not count as dominating the post-loop use. distinct
// method per loop form so each form owns its import
let M = Array;
for (const { z = (M = Object) } of []) { void z; }
export const y = M.from([1]);

let N = Array;
const sink = {};
for (sink[N = Object] in { a: 1 }) { break; }
export const w = N.of(2);
