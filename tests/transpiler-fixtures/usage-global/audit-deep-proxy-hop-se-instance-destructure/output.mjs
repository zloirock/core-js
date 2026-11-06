import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global parity for a side-effecting proxy-global HOP key DEEPER than an immediate static collapse -
// under `.Array.prototype` on an instance-method receiver. usage-global keeps the member verbatim (the buried
// eff() is never folded away) and resolves the instance polyfills THROUGH the deep SE-hop proxy chain, injecting
// each side-effect import. mirrors the pure shape set: instance `.call`, destructure binding, DOUBLE hop, and a
// no-SE computed control. distinct instance method per line so no two lines share a chain.
let log = [];
function eff(tag) {
  log.push(tag);
  return 'self';
}
const callInstance = globalThis[eff('a'), 'self'].Array.prototype.flat.call([1, [2]]);
const {
  flatMap
} = globalThis[eff('b'), 'self'].Array.prototype;
const deepDouble = globalThis[eff('c'), 'self'][eff('d'), 'window'].Array.prototype.at.call([5, 6], 0);
const noSe = globalThis['self'].Array.prototype.findLast.call([7], Boolean);
export { callInstance, flatMap, deepDouble, noSe, log };