import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// usage-global parity for a proxy-global hop in a destructure-default receiver with an SE-bearing key: the
// destructured statics resolve THROUGH the proxy chain + folded key (so their imports inject) and the default
// stays verbatim - usage-global never collapses the receiver or drops the buried effect the way usage-pure's
// memo path could. mirrors the pure chain set: IIFE-root `.self`, IIFE-root computed `[(c++, 'self')]`, and a
// bare-root computed hop - each with a DISTINCT receiver + method so no two lines share a chain.
let c = 0;
function iifeRootDotSelf({
  of,
  length
} = (() => {
  c++;
  return globalThis;
})().self.Array) {
  return [of, length];
}
function iifeRootHopKey({
  from,
  name
} = (() => {
  c += 10;
  return globalThis;
})()[c++, 'self'].Array) {
  return [from, name];
}
function bareRootHopKey({
  fromEntries,
  entries
} = globalThis[c += 100, 'self'].Object) {
  return [fromEntries, entries];
}
export { iifeRootDotSelf, iifeRootHopKey, bareRootHopKey, c };