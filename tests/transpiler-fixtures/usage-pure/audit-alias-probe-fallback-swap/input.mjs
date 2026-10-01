// the receiver-swap (static-FALLBACK) twins over a probe-holding alias: the swap re-bases a
// surviving member, so the probe respells only the RECEIVER run (the member still reads once);
// a bare-alias receiver has no erased run to respell and the swap stands down whole; a seal
// DIRECTLY under the member is the one shape the whole-member walk owns
const heldProbe = globalThis.window;
export const fallbackChainRead = heldProbe.Promise.noSuchStatic;
const heldPromise = globalThis.window?.Promise;
export const fallbackBareAliasRead = heldPromise.noSuchStatic;
export const sealUnderClaimRead = (globalThis.window?.Promise).noSuchStatic;
export const sealUnderReceiverRead = (globalThis.window?.self).Promise.noSuchStatic;
export const sealAliasUnderClaimRead = (heldProbe?.Promise).noSuchStatic;
