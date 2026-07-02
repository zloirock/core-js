// a for-init destructure whose consumed receiver navigates proxy hops keeps its side effects
// in a loop-header sink; a MULTI-hop receiver cannot sink verbatim (the raw hop reads an
// undefined intermediate off-browser), so only the harvested effects sink - the chain-root
// call and a computed hop-key effect, in source-eval order. polyfillable content inside the
// harvested effects keeps its own rewrite; a single-hop receiver still sinks verbatim
let c = 0;
function sf() {
  c++;
  return globalThis;
}
let out1;
for (const { groupBy } = sf()[(c++, 'self')].Map; c < 3;) {
  out1 = typeof groupBy;
  c++;
}
export const r1 = [out1, c];
let d = 0;
let out2;
for (const { resolve } = globalThis[(d++, 'self')].Promise; d < 2;) {
  out2 = typeof resolve;
  d++;
}
export const r2 = [out2, d];
let a;
let out3;
for (const { iterator } = globalThis[(a = Array.of(2), 'self')].Symbol; !out3;) {
  out3 = typeof iterator;
}
export const r3 = [out3, a.length];
let q;
let out4;
for (const { from } = (q = Object.entries({ k: 1 }), Array); !out4;) {
  out4 = typeof from;
}
export const r4 = [out4, q.length];
