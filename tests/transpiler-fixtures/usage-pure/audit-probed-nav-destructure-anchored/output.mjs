import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings (which would erase the throw and
// run computed-key effects the source never reaches)

// SE-computed-key leaf under a static-ctor pattern hop: extraction + guarded residual (the
// key effect and the throw both live in the residual read)
let f1 = 0;
export const viaAnchoredSealedSeKey = _Object$freeze;
export const {
  [(f1++, 'freeze')]: _unused
} = (null == _globalThis.window ? void 0 : _self).Object;
export { f1 };

// unresolvable custom leaf under a resolvable ctor hop: the residual re-anchors onto the
// guarded member read, not the always-defined ctor binding
export const {
  customY: viaAnchoredSealedCustom
} = (null == _globalThis.window ? void 0 : _self).Map;

// member-read anchor (no whole-ctor pure entry) over a LIVE probe
export const {
  floor: viaAnchoredLiveFloor
} = (null == _globalThis.window ? void 0 : _self).Math;

// FULL consume: the extraction carries the guarded anchor read as a throw probe, once per
// pattern (native throws before any prop read)
export const viaAnchoredSealedFull = ((null == _globalThis.window ? void 0 : _self).JSON, _JSON$stringify); // DEFINED navs keep the plain anchored collapses - no guard, no probe
export const viaDefinedAnchoredTrunc = _Math$trunc;
export const viaDefinedAnchoredOwnKeys = _Reflect$ownKeys; // for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const {
  floor: viaForInitAnchor
} = (null == _globalThis.window ? void 0 : _self).Math; f2 < 1; f2++) {
  void viaForInitAnchor;
}
let f3 = 0;
for (const {
    [(f3++, 'keys')]: _unused2
  } = (null == _globalThis.window ? void 0 : _self).Object, viaForInitSeKey = _Object$keys; f3 < 2;) {
  void viaForInitSeKey;
  break;
}
export { f2, f3 };

// a slot-MUTATED anchor ctor keeps the RAW member read through the guard (the user's
// replacement stays visible at a present probe; the throw survives at an absent one)
_globalThis.Map = function PatchedMap() {};
export const {
  customY: viaMutatedAnchor
} = (null == _globalThis.window ? void 0 : _self).Map;

// NEGATIVES: resolvable roots/hops keep the collapse, a PARTIAL consume keeps its residual
export const viaDefinedRoot = _Array$of;
export const viaResolvableHop = _Array$of;
export const viaAllPlainNav = _Array$of;
export const viaPartialConsume = _Array$of;
export const {
  of: _unused3,
  ...viaPartialRest
} = _globalThis.window?.Array;