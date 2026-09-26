// side effects harvested and re-emitted by a receiver collapse keep their own polyfillable
// content rewritten: the harvested subtrees are rescued from the collapse's visitor skip, so
// their queued rewrites compose into the re-emitted text (a bare re-emit shipped raw natives
// to targets without them). the collapsed root's eager import is also not injected when the
// collapse emits its own bindings, so no dead import line strands
let a1;
const { iterator } = globalThis[(a1 = Array.of(1), 'self')].Symbol;
export const r1 = [typeof iterator, a1.length];
let c1 = 0;
const { resolve } = globalThis[(c1++, 'self')].Promise;
export const r2 = [typeof resolve, c1];
let a2;
function sf() {
  return globalThis;
}
const { groupBy } = sf()[(a2 = Object.entries({ q: 1 }), 'self')].Map;
export const r3 = [typeof groupBy, a2.length];
let a3;
function nf() {
  return globalThis;
}
const { asyncIterator } = nf().self[(a3 = Object.values({ w: 2 }), 'Symbol')];
export const r4 = [typeof asyncIterator, a3.length];
let a4;
const { from } = globalThis.self[(a4 = Object.fromEntries([['z', 3]]), 'Array')];
export const r5 = [typeof from, a4.z];
let a5;
const { isInteger } = (a5 = Array.from('ab'), globalThis).Number;
export const r6 = [typeof isInteger, a5.length];
let a6;
const { for: symFor } = (a6 = Object.groupBy([1, 2], v => v % 2), globalThis).Symbol;
export const r7 = [typeof symFor, typeof a6];
