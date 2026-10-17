import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
_globalThis.Set = class PatchedSet extends _Set {};
// the mutated slot read off a SEALED receiver: the seal ends the chain, so the source reads the
// key off a value that CAN be undefined and throws there. collapsing the navigation away answered
// the patched value instead - the guarded read has to survive, and it is the ANSWER as well as the
// throw: a mutation cancels the ponyfill, so there is nothing else for the collapse to substitute
export const sealedMutatedSlot = (null == _globalThis.window ? void 0 : _self).Set;