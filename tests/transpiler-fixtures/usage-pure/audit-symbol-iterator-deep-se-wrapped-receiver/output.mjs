import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global receiver DEEPER than the immediate `[Symbol.iterator]` hop - a `.Array.prototype` chain
// sits between the proxy and the symbol - is KEPT as the polyfill argument, so it must collapse to the
// proxy ROOT (always defined) the SAME way on both emitters. the immediate-hop resolver does not reach this
// depth, so a SE-wrapped dotted hop and a SE-bearing computed-key hop each left a raw `globalThis.self`
// (undefined off-engine) on babel while the other emitter collapsed it. lines vary by RECEIVER shape: a
// SE-wrapped dotted hop, a SE-bearing computed-key hop, a plain deep hop (control, already collapsed), a
// real-object receiver (control, no proxy). the trailing counter proves the dropped-hop side effects are
// preserved in source order.
let c = 0;
const seWrapped = _getIteratorMethod((c++, _globalThis).Array.prototype);
const computedKey = _getIteratorMethod((c++, _globalThis).Array.prototype);
const plainDeep = _getIteratorMethod(_globalThis.Array.prototype);
const real = _getIteratorMethod([1]);
export { seWrapped, computedKey, plainDeep, real, c };