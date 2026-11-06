import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// the seal ends the chain before the claim's own key, so the source reads `.of` off a value that
// can be undefined - the erase re-emits exactly that read ahead of the claim. the alternate is the
// global's own name where core-js ponyfills no constructor for it
export const parenthesizedClaim = ((null == _globalThis.window ? void 0 : Array).of, _Array$of)(1);