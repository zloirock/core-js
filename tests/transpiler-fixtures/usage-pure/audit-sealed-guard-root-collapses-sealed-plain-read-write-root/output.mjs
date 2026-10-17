import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a seal over a LIVE `?.` with a PLAIN read above it performs that read itself and throws off-window,
// so an OPTIONAL claim over it tests the READ, not the probe under the seal. re-keyed onto the probe
// the test answered `void 0` where the source throws - and the same source with a static CALL tail
// kept the throw, one class with two answers
let w;
export const sealedPlainReadWriteRoot = ((null == (w = _globalThis).window ? void 0 : _self).Symbol, _Symbol$iterator);
export { w };