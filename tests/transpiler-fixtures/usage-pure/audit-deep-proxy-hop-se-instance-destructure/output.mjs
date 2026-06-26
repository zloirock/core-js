import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A side-effecting proxy-global HOP key sitting DEEPER than an immediate static collapse - under
// `.Array.prototype` on an instance-method receiver (`globalThis[(eff(), 'self')].Array.prototype.flat`).
// the immediate-hop resolver only saw the native `.Array` directly above the hop, so it left a dead
// `_globalThis.self` (undefined off-engine) and dropped eff(). usage-pure must collapse the redundant hop to
// the proxy ROOT pure import and HARVEST the buried eff() ahead of it (`(eff(), _globalThis).Array.prototype`),
// uniformly across an instance `.call`, a destructure binding, a DOUBLE hop (both keys harvested in source
// order), and a no-SE computed control (collapses with no harvest). distinct instance method per line.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return 'self';
}
const callInstance = _flatMaybeArray((eff('a'), _globalThis).Array.prototype).call([1, [2]]);
const flatMap = _flatMapMaybeArray((eff('b'), _globalThis).Array.prototype);
const deepDouble = _atMaybeArray((eff('c'), eff('d'), _globalThis).Array.prototype).call([5, 6], 0);
const noSe = _findLastMaybeArray(_globalThis.Array.prototype).call([7], Boolean);
export { callInstance, flatMap, deepDouble, noSe, log };