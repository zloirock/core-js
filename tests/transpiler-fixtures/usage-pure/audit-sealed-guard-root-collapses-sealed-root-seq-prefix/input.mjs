// A guard ROOT reading through a seal over a PLAIN nav collapses with it: the seal hides no short-circuit, so the value canon
// reads the nav as the proxy global it navigates and the claim needs no test at all.
let n = 0;
// the sequence-rooted twin collapses like the plain ones, keeping its prefix effect ahead of the claim
export const sealedRootSeqPrefix = ((n++, globalThis.window).self)?.window.Promise.resolve(1);
