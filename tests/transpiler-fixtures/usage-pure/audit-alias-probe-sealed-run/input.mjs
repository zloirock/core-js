// a SEAL over the dotted run above a probe-holding alias is not load-bearing (it hides no
// short-circuit), so the sealed spellings probe exactly like the unsealed twin; a sealed run
// over a DEFINED held value keeps the plain swap - nothing to probe
const heldProbe = globalThis.window;
export const sealedChainRunRead = (heldProbe.Array).of(17);
export const sealedChainRunDouble = ((heldProbe.Array)).of(18);
const heldSelf = globalThis.self;
export const sealedDefinedRunRead = (heldSelf.Array).of(19);
