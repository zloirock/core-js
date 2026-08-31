import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a SEAL over the dotted run above a probe-holding alias is not load-bearing (it hides no
// short-circuit), so the sealed spellings probe exactly like the unsealed twin; a sealed run
// over a DEFINED held value keeps the plain swap - nothing to probe
const heldProbe = _globalThis.window;
export const sealedChainRunRead = (heldProbe.Array.of, _Array$of)(17);
export const sealedChainRunDouble = (heldProbe.Array.of, _Array$of)(18);
const heldSelf = _self;
export const sealedDefinedRunRead = _Array$of(19);