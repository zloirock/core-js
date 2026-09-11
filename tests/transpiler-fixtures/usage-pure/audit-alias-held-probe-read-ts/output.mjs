import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// TS skins on an alias-held run are value-transparent to the throw probe: the erased read
// probes exactly like the bare spelling, whichever wrapper the init or the receiver wears
const heldProbe = _globalThis.window;
export const viaAsInit = (heldProbe.Array, _Array$of);
export const viaBangInit = (heldProbe.Array, _Array$of);
export const viaAsReceiver = (heldProbe.Array.of, _Array$of)(21);
export const viaBangReceiver = (heldProbe.Array.of, _Array$of)(22);