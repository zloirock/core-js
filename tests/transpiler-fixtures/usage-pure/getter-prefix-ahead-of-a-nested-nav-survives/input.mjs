// a getter-read prefix element (`K.g`, `O.g`) ahead of a NESTED prototype or surface nav is work the
// source does: every host that elides the prefix to reach the nav keeps the read, once, in the order
// the source ran it - declaration, assignment, literal slot, array wrapper, loop head, export
class K { static get g() { log(); return 0; } }
const O = { get g() { log(); return 0; } };
const { Array: { prototype: { at: m1, flat: f1 } } } = (K.g, globalThis);
const { Array: { prototype: { copyWithin: m2 } } } = (K.g, globalThis);
const { prototype: { findLast: m3 } } = (K.g, Array);
const { prototype: { find: m4, findIndex: f4 } } = (K.g, Array);
const { Array: { prototype: { flatMap: m5, with: f5 } } } = (O.g, globalThis);
let m6, f6;
({ Array: { prototype: { toReversed: m6, toSorted: f6 } } } = (K.g, globalThis));
const { w: { toSpliced: m7 } } = { w: (K.g, Array.prototype) };
const [{ Array: { prototype: { findLastIndex: m8, includes: f8 } } }] = [(K.g, globalThis)];
const [{ Array: { prototype: { sort: m9 } } }, z9] = [(K.g, globalThis), 1];
for (const { Array: { prototype: { entries: m10, keys: f10 } } } = (K.g, globalThis); ;) break;
export const { Array: { prototype: { values: m11, fill: f11 } } } = (K.g, globalThis);
use(m1, f1, m2, m3, m4, f4, m5, f5, m6, f6, m7, m8, f8, m9, z9, m11, f11);
