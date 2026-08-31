import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
// the receiver-swap (static-FALLBACK) twins over a probe-holding alias: the swap re-bases a
// surviving member, so the probe respells only the RECEIVER run (the member still reads once);
// a bare-alias receiver has no erased run to respell and the swap stands down whole; a seal
// DIRECTLY under the member is the one shape the whole-member walk owns
const heldProbe = _globalThis.window;
export const fallbackChainRead = (heldProbe.Promise, _Promise).noSuchStatic;
const heldPromise = null == _globalThis.window ? void 0 : _Promise;
export const fallbackBareAliasRead = heldPromise.noSuchStatic;
export const sealUnderClaimRead = ((null == _globalThis.window ? void 0 : _Promise).noSuchStatic, _Promise).noSuchStatic;
export const sealUnderReceiverRead = ((null == _globalThis.window ? void 0 : _self).Promise, _Promise).noSuchStatic;
export const sealAliasUnderClaimRead = ((null == heldProbe ? void 0 : _Promise).noSuchStatic, _Promise).noSuchStatic;