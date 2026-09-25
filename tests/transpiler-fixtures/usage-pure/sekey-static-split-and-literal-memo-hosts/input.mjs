// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let k = 0;
function pre() {}
function eff() {}
export const first = 1, { [(k++, 'from')]: f, m } = Array;
export const lead = pre(), { [(k++, 'of')]: ko, alsoMore } = (eff(), Array);
var lead2 = pre(), { [(k++, 'of')]: ko2 = 1, m2 } = Array;
var lead3 = pre(), { [(k++, 'Map')]: P, m3 } = (eff(), globalThis);
var lead4 = pre(), { [(k++, 'of')]: ko4, ...r4 } = Array;
var lead5 = pre(), { [(k++, 'of')]: ko5, [(k++, 'from')]: fr5, m5 } = Array;
for (var lead6 = pre(), { [(k++, 'of')]: ko6, m6 } = (eff(), Array); false;) break;
if (k) var lead7 = pre(), { [(k++, 'of')]: ko7, m7 } = (eff(), Array);
while (k < 0) var lead8 = pre(), { [(k++, 'of')]: ko8, m8 } = Array;

// A literal receiver is evaluated once before its effectful key. Sibling declarators and
// control-flow hosts retain that position, and exports expose only the source bindings.
var t1 = 0, { [(k++, 'at')]: a1 } = [1];
var { [(k++, 'at')]: a2 } = [1], t2 = 0;
var t3 = 0, { [(k++, 'at')]: a3, other3 } = [1];
for (var t4 = 0, { [(k++, 'at')]: a4 } = [1]; false;) break;
if (k) var t5 = 0, { [(k++, 'at')]: a5 } = [1];
export const t6 = 0, { [(k++, 'at')]: a6 } = [1];

// Claimed and unclaimed keys interleave in source order: key, read, key, read. Sibling
// properties following an instance claim are read only after its dispatch.
var { [(k++, 'of')]: o7, [(k++, 'at')]: a7, m7b } = [1];
var { [(k++, 'at')]: a8, m8b, [(k++, 'of')]: o8 } = [1];

// Bodyless declaration hosts preserve sibling order. A nested static keeps its ordinary
// extraction, while an effectful instance key runs before dispatch and later property reads.
do var { Array: { from: f9 }, keep9 } = globalThis, tail9 = 1; while (k < 0);
if (k) var lead10 = pre(), { [(k++, 'at')]: a10, m10 } = [1, 2];

// several claimed hosts of one declaration - an object hop and the array wrappers beside it - stay one
// declaration: each literal takes its mirror in place
const { w: { Map: M11 }, z11 } = { w: globalThis, z11: 1 }, [{ Set: S11 }, y11] = [globalThis, 2], [{ WeakMap: W11 }, q11] = [globalThis, 3];

export default [f, m, ko, alsoMore, lead, ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, a1, a2, a3, other3, a4, a5, a6, t1, t2, t3, t4, t5, t6, o7, a7, m7b, a8, m8b, o8, f9, keep9, tail9, a10, m10, M11, z11, S11, y11, W11, q11, lead2, lead3, lead4, lead5, lead6, lead7, lead8, lead10, k];
