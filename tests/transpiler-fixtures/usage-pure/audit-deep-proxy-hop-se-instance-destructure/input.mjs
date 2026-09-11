// A side-effecting proxy-global HOP key sitting DEEPER than an immediate static collapse - under
// `.Array.prototype` on an instance-method receiver (`globalThis[(eff(), 'self')].Array.prototype.flat`).
// the immediate-hop resolver only saw the native `.Array` directly above the hop, so it left a dead
// `_globalThis.self` (undefined off-engine) and dropped eff(). usage-pure must collapse the redundant hop to
// the proxy ROOT pure import and HARVEST the buried eff() ahead of it (`(eff(), _globalThis).Array.prototype`),
// uniformly across an instance `.call`, a destructure binding, a DOUBLE hop (both keys harvested in source
// order), and a no-SE computed control (collapses with no harvest). distinct instance method per line.
let log = [];
function eff(tag) {
  log.push(tag);
  return 'self';
}
const callInstance = globalThis[(eff('a'), 'self')].Array.prototype.flat.call([1, [2]]);
const { flatMap } = globalThis[(eff('b'), 'self')].Array.prototype;
const deepDouble = globalThis[(eff('c'), 'self')][(eff('d'), 'window')].Array.prototype.at.call([5, 6], 0);
const noSe = globalThis['self'].Array.prototype.findLast.call([7], Boolean);
export { callInstance, flatMap, deepDouble, noSe, log };
