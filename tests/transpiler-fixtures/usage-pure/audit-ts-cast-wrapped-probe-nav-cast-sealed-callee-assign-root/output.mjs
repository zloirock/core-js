import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A cast around the whole nav in CALLEE position seals the chain exactly as parens do, so the call applies to what the chain
// produced and throws on the short-circuited value.
let held: unknown;
export const castSealedCalleeAssignRoot = (null == (held = _globalThis.window) ? void 0 : _self)(1);