import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const {
  customY: viaAnchoredSealedCustom
} = (null == _globalThis.window ? void 0 : _self).Map;
// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
_globalThis.Map = function PatchedMap() {};