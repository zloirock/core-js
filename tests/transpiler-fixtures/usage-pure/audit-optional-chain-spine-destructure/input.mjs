// a destructure whose RECEIVER spine wears an optional-chain marker: on ESTree the marker is a
// node the receiver questions meet before anything else, and peeling it or not is the whole
// difference between the two wrapper sets the extraction asks through. every row keeps a
// distinct spine shape - an SE computed hop key, a nested pattern with a surviving residual,
// a plain hop, a paren-sealed hop, a defaulted leaf, an array pattern, a rest sibling, a
// write-rooted spine and a call-rooted one. the emitters agree on the extraction and part
// only where they already do off the marker: the key effect's placement (a comma inside the
// value vs a hoisted statement) and the dead receiver read the babel leg keeps
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
