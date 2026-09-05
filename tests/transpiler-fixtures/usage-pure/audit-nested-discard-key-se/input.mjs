// a nested destructure consuming its receiver must re-emit the side effect buried in the
// receiver's computed hop KEY: the discard probe folds the key, and a chain-assignment /
// root-call-only rescue dropped the key effect silently - on a full consume (receiver gone)
// and on a partial consume (receiver swapped under the surviving residual). polyfillable
// content inside the harvested key keeps its own rewrite; a chain-root call interleaves
// with the key effect in source-eval order
let c = 0;
const { Symbol: { iterator } } = globalThis[(c++, 'self')];
export const r1 = [typeof iterator, c];
let d = 0;
const { Promise: { resolve }, other } = globalThis[(d++, 'self')];
export const r2 = [typeof resolve, typeof other, d];
let a;
const { Map: { groupBy } } = globalThis[(a = Array.of(3), 'self')];
export const r3 = [typeof groupBy, a.length];
let k = 0;
function mk() {
  k++;
  return globalThis;
}
const { Object: { entries } } = mk()[(k++, 'self')];
export const r4 = [typeof entries, k];
