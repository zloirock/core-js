// A for-init destructure whose consumed receiver navigates proxy hops keeps its side effects in a loop-header sink; a MULTI-hop
// receiver cannot sink verbatim (the raw hop reads an undefined intermediate off-browser), so only the harvested effects sink -
// the chain-root call and a computed hop-key effect, in source-eval order.
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
