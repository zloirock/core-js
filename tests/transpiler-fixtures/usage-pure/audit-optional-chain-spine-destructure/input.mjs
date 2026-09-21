// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let c = 0;
const { Symbol: { iterator } } = globalThis?.[(c++, 'self')];
export const r1 = [typeof iterator, c];
let d = 0;
const { Promise: { resolve }, other } = globalThis?.[(d++, 'self')];
export const r2 = [typeof resolve, typeof other, d];
const { of } = globalThis?.self.Array;
export const r3 = typeof of;
const { entries } = (globalThis?.self).Object;
export const r4 = typeof entries;
let e = 0;
const { groupBy } = globalThis?.self[(e++, 'Map')];
export const r5 = [typeof groupBy, e];
const { flat = null } = globalThis?.Array.prototype;
export const r6 = typeof flat;
const [head] = globalThis?.self.Array.of(1, 2);
export const r7 = head;
const { from, ...restOfArray } = globalThis?.self.Array;
export const r8 = [typeof from, typeof restOfArray];
let u;
const { fromEntries } = (u = globalThis?.self).Object;
export const r9 = [typeof fromEntries, typeof u];
function mk() { return globalThis; }
const { assign } = mk()?.self.Object;
export const r10 = typeof assign;
