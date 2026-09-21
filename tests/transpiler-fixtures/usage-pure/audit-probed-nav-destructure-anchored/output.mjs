import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
// A computed static leaf captures the guarded Object value first.
// An absent nav throws before the key effect; a defined nav runs the key effect
// before initializing the pure binding.

let f1 = 0;
export const {
  Object: {
    [(f1++, 'freeze')]: viaAnchoredSealedSeKey
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  Object: {
    freeze: _Object$freeze
  }
});
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
export const {
  JSON: {
    stringify: viaAnchoredSealedFull
  }
} = ({} = null == _globalThis.window ? void 0 : _self, {
  JSON: {
    stringify: _JSON$stringify
  }
});

// DEFINED navs keep the plain anchored collapses - no guard, no probe
export const {
  Math: {
    trunc: viaDefinedAnchoredTrunc
  }
} = {
  Math: {
    trunc: _Math$trunc
  }
};
export const {
  Reflect: {
    ownKeys: viaDefinedAnchoredOwnKeys
  }
} = {
  Reflect: {
    ownKeys: _Reflect$ownKeys
  }
};

// for-init hosts ride the same guard renders (member-read anchor in the for-head, SE-key
// leaf via the trailing sink declarator)
let f2 = 0;
for (const {
  floor: viaForInitAnchor
} = (null == _globalThis.window ? void 0 : _self).Math; f2 < 1; f2++) {
  void viaForInitAnchor;
}
let f3 = 0;
for (const _ref = (null == _globalThis.window ? void 0 : _self).Object, viaForInitSeKey = null == _ref ? _ref[""] : (f3++, _Object$keys); f3 < 2;) {
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
const _ref2 = _globalThis.window?.Array,
  viaPartialConsume = null == _ref2 ? _ref2[""] : _Array$of,
  {
    of: _unused,
    ...viaPartialRest
  } = _ref2;
export { viaPartialConsume, viaPartialRest };