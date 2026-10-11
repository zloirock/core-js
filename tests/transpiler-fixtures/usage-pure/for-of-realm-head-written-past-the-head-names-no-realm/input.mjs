// a for-of head over the realm names the realm only while the head is its sole write: a head the body or a
// later statement reassigns may hold the replacement at the read, which keeps its live value. usage-pure
// only: the global flavor injects either way
for (let g of [globalThis]) {
  if (c) g = { Map: MapShim };
  use(g.Map.groupBy(list, key));
}
for (var h of [globalThis]) later.push(() => h.Promise.resolve(1));
h = { Promise: PromiseShim };
