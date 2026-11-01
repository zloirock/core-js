import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A mutated constructor retains its raw slot through the guard: the user's replacement
// stays visible at a present probe, and the destructure still throws at an absent one.
_globalThis.Map = function PatchedMap() {};
export const {
  Map: {
    customY: viaMutatedAnchor
  }
} = null == _globalThis.window ? void 0 : _self;