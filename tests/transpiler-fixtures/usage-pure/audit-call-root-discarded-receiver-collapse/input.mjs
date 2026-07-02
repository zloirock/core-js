// a DISCARDED call/IIFE-rooted proxy receiver with a pure-ctor leaf whole-swaps the leaf and
// re-emits every side effect the dropped navigation carried - the SE-bearing chain-root call,
// a computed hop-key effect, and an effect buried in the LEAF's own computed key - in source
// order ahead of it. the decision is the shared discarded-receiver plan; a pure chain-root
// call is dropped entirely. the leaf key resolves through the canonical fold, so an
// SE-sequence leaf key still swaps instead of stranding the raw proxy hop; a folded leaf
// WITHOUT a pure ctor entry falls back to the root-collapse residual, keeping the key read
let c = 0;
function sf() {
  c++;
  return globalThis;
}
const { groupBy } = sf()[(c++, 'self')].Map;
export const r = [typeof groupBy, c];
const f = () => globalThis;
const { iterator } = (f()).self.Symbol;
export const q = typeof iterator;
let n = 0;
function pf() {
  n++;
  return globalThis;
}
const { resolve } = pf().self.Promise;
export const p = [typeof resolve, n];
let k = 0;
function af() {
  k++;
  return globalThis;
}
const { from } = af().self[(k++, 'Array')];
export const a = [typeof from, k];
let z = 0;
function nf() {
  z++;
  return globalThis;
}
const { asyncIterator } = nf().self[(z++, 'Symbol')];
export const i = [typeof asyncIterator, z];
