import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// claimable-string control: the leaf claims through its own ponyfill, no collapse race
let c;
export const claimableLeaf = (c = _globalThis, _Set);