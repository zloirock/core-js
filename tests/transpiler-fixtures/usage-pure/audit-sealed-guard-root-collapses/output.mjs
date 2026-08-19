import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a guard ROOT reading through a seal over a PLAIN nav collapses with it: the seal hides no
// short-circuit, so the value canon reads the nav as the proxy global it navigates and the claim
// needs no test at all. spelling the probe there (`null == _globalThis.window ? void 0 : _self`)
// read the host environment off the ponyfill - undefined in exactly the realms the polyfill is for,
// so the claim answered `void 0` or threw one hop later. only a seal over a LIVE `?.` keeps its
// test, and the composed test needs its own parens: spliced bare it re-associated into
// `null == null == x ? void 0 : y ? ...`, which is not even the same expression.
// the corpus cannot hold these: native THROWS on them, and a throwing native is vacuous there.
let n = 0;
let b;
export const sealedRootPlainRead = _Promise$resolve(1);
export const sealedRootBareClaim = _Promise$resolve(1);
export const sealedRootOptionalClaim = _Promise$resolve(1);
// the sequence-rooted twin collapses like the plain ones, keeping its prefix effect ahead of the claim
export const sealedRootSeqPrefix = (n++, _Promise$resolve)(1);
// the seal over a LIVE `?.` was always rendered - its short-circuit is the guard's own subject
export const sealedRootLiveOptional = ((null == _globalThis.window ? void 0 : _self).window, _Promise$resolve)(1);
// NEGATIVE: no seal, so the whole navigation collapses and the claim needs no guard at all
export const unsealedRoot = _Promise$resolve(1);
// NEGATIVE: a kept write under the `?.` - the guard tests the write, no seal to preserve
export const keptWriteRoot = null == (b = _globalThis.window) ? void 0 : _Array$of(5);
// a seal over a LIVE `?.` with a PLAIN read above it performs that read itself and throws off-window,
// so an OPTIONAL claim over it tests the READ, not the probe under the seal. re-keyed onto the probe
// the test answered `void 0` where the source throws - and the same source with a static CALL tail
// kept the throw, one class with two answers
let w;
export const sealedPlainReadOptionalClaim = ((null == _globalThis.window ? void 0 : _self).Symbol, _Symbol$iterator);
export const sealedPlainReadWriteRoot = ((null == (w = _globalThis).window ? void 0 : _self).Symbol, _Symbol$iterator);
export const sealedPlainReadCallRoot = ((null == (() => _globalThis)().window ? void 0 : _self).Symbol, _Symbol$iterator);
// NEGATIVE: an OPTIONAL consumer of the sealed value performs no read - its short-circuit IS the
// guard's void-0 branch, so the test keys onto the probe under the seal
export const sealedOptionalConsumer = null == _globalThis.window ? void 0 : _Array$of;
export { w };